import * as moment from 'moment';
import {
  AcCommands,
  AirConditioningCommand,
  CommandsSet,
  RollerCommands,
  ToggleCommands,
} from '../../models/backendInterfaces';
import {
  AirConditioning,
  DeviceKind,
  ErrorResponse,
  Minion,
  MinionStatus,
  SwitchOptions,
} from '../../models/sharedInterfaces';
import { CommandsCacheManager } from '../../utilities/cacheManager';
import { logger } from '../../utilities/logger';
import { Delay, sleep } from '../../utilities/sleep';
import { BrandModuleBase } from '../brandModuleBase';
import * as broadlink from 'node-broadlink';
import Device from 'node-broadlink/dist/device';
import { Rmpro, Sp2 } from 'node-broadlink';
import { Duration, Temperature } from 'unitsnet-js';

// tslint:disable-next-line:no-var-requires
const BroadlinkCodeGeneration = require('./commands-generator');

const RESEND_BEAM_COMMAND_TIMES = +(process.env.RESEND_BEAM_COMMAND_TIMES || '1');

function toNormalMac(array) {
  let finalMac = '';
  for (const item of array) {
    finalMac = `${finalMac}${item.toString(16).padStart(2, '0')}`
  }
  return finalMac;
}

export class BroadlinkHandler extends BrandModuleBase {

  public readonly brandName: string = 'broadlink';

  public readonly devices: DeviceKind[] = [
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: 1,
      model: 'SP2',
      supportedMinionType: 'switch',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'RM3 / RM Pro as IR AC',
      supportedMinionType: 'airConditioning',
      isRecordingSupported: true,
      isFetchCommandsAvailable: true,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'RM Pro as RF toggle',
      supportedMinionType: 'toggle',
      isRecordingSupported: true,
      isFetchCommandsAvailable: true,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'RM Pro as RF roller',
      supportedMinionType: 'roller',
      isRecordingSupported: true,
      isFetchCommandsAvailable: true,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'RM Pro as temperature',
      supportedMinionType: 'temperatureSensor',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
  ];

  private commandsCacheManager = new CommandsCacheManager(super.cacheFilePath)

  public constructor() {
    super();
    this.fetchDevicesStateInterval()
  }

  public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    switch (minion.device.model) {
      case 'SP2':
        return await this.getSP2Status(minion);
      case 'RM Pro as RF toggle':
      case 'RM3 / RM Pro as IR AC':
      case 'RM Pro as RF roller':
        return await this.getCachedStatus(minion);
      case 'RM Pro as temperature':
        return await this.getTemperature(minion);
    }
    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    switch (minion.device.model) {
      case 'SP2':
        return await this.setSP2Status(minion, setStatus);
      case 'RM Pro as RF toggle':
        return await this.setRFToggleStatus(minion, setStatus);
      case 'RM3 / RM Pro as IR AC':
        return await this.setIrAcStatus(minion, setStatus);
      case 'RM Pro as RF roller':
        return await this.setRFRollerStatus(minion, setStatus);
      case 'RM Pro as temperature':
        return; // Nothing to do...
    }
    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async enterRecordMode(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    switch (minion.device.model) {
      case 'RM Pro as RF toggle':
        return await this.recordRFToggleCommands(minion, statusToRecordFor);
      case 'RM3 / RM Pro as IR AC':
        return await this.recordIRACommands(minion, statusToRecordFor);
      case 'RM Pro as RF roller':
        return await this.recordRollerRFCommand(minion, statusToRecordFor);
    }
    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async generateCommand(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    switch (minion.device.model) {
      case 'RM Pro as RF toggle':
        return await this.generateToggleRFCommand(minion, statusToRecordFor);
      case 'RM Pro as RF roller':
        return await this.generateRollerRFCommand(minion, statusToRecordFor);
    }
    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    await this.commandsCacheManager.setFetchedCommands(minion, commandsSet);
  }

  public async refreshCommunication(): Promise<void> {
    // There's nothing to do.
  }

  /** Get broadlink protocol handler instance for given minion */
  private async getBroadlinkInstance(minion: Minion): Promise<Device | ErrorResponse> {
    try {
      const list: Device[] = await broadlink.discover();

      logger.info(`[BroadlinkModule.getBroadlinkInstance] Devices founded ${list.map(i => toNormalMac(i.mac)).join(',')}`);

      const device = list.find(i => toNormalMac(i.mac) === minion.device.pysicalDevice.mac);

      if (!device) {
        logger.error(`[BroadlinkModule.getBroadlinkInstance] Device ${minion.minionId} ${minion.device.pysicalDevice.mac} not discovered`);
        throw {
          responseCode: 1503,
          message: 'No device discovered',
        } as ErrorResponse;
      }

      await device.auth();
      return device;

    } catch (error) {
      logger.error(`[BroadlinkModule.getBroadlinkInstance] Device ${minion.minionId} ${minion.device.pysicalDevice.mac} Commination failed $`);
      throw {
        responseCode: 1503,
        message: 'Commination failed',
      } as ErrorResponse;
    }
  }

  /** Send RF/IR command */
  private async sendBeamCommand(broadlink: Rmpro, beamCommand: string | string[]): Promise<void> {
    try {

      if (typeof beamCommand === 'string') {
        await broadlink.sendData(beamCommand);
      } else {
        for (const command of beamCommand) {
          await broadlink.sendData(command);
        }
      }

    } catch (error) {
      logger.error(` ${error?.message}`);
      throw {
        responseCode: 11503,
        message: 'Sending beam command fail.',
      } as ErrorResponse;
    }
  }

  /** Enter learn mode */
  private async enterBeamLearningMode(broadlink: Rmpro): Promise<string> {
    try {
      await broadlink.enterLearning();
      const buff = await broadlink.checkData();
      return buff.toString('hex');
    } catch (error) {
      logger.error(` ${error?.message}`);
      throw {
        responseCode: 2503,
        message: 'Recording fail or timeout',
      } as ErrorResponse;
    }
  }

  /** Get current broadlink power */
  private async getBroadlinkPowerMode(broadlink: Sp2): Promise<SwitchOptions | ErrorResponse> {
    try {
      const power = await broadlink.checkPower();
      return power ? 'on' : 'off';
    } catch (error) {
      logger.error(` ${error?.message}`);
      throw {
        responseCode: 7503,
        message: 'Getting status fail',
      } as ErrorResponse;
    }
  }

  /** Set broadlink power */
  private async setBroadlinkPowerMode(
    broadlink: Sp2,
    switchOptions: SwitchOptions,
  ): Promise<void | ErrorResponse> {
    try {
      await broadlink.setPower(switchOptions === 'on');
    } catch (error) {
      logger.error(` ${error?.message}`);
      throw {
        responseCode: 6503,
        message: 'Setting status fail',
      } as ErrorResponse;
    }
  }

  /**
   * Get last status, use in all devices that not holing any data, such as IR transmitter.
   * @param minion minion to get last status for.
   */
  private async getCachedStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    // Detect if the broadlink device communication is alive 
    await this.getBroadlinkInstance(minion);
    return await this.commandsCacheManager.getCachedStatus(minion);
  }

  private async getSP2Status(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as Sp2;

    const status = (await this.getBroadlinkPowerMode(broadlink)) as SwitchOptions;
    return {
      switch: {
        status,
      },
    };
  }

  private async getTemperature(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as Rmpro;
    const temperatureFahrenheit = await broadlink.checkTemperature();
    const temperature = parseFloat(Temperature.FromDegreesFahrenheit(temperatureFahrenheit).DegreesCelsius.toFixed(2));


    return {
      temperatureSensor: {
        temperature,
        status: 'on',
      },
    };
  }

  private async setSP2Status(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as Sp2;

    await this.setBroadlinkPowerMode(broadlink, setStatus.switch.status);
  }

  private async setRFToggleStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as Rmpro;

    const hexCommandCode = await this.commandsCacheManager.getRFToggleCommand(minion, setStatus) as string;

    await this.sendBeamCommand(broadlink, hexCommandCode);

    await this.commandsCacheManager.cacheLastStatus(minion, setStatus);
  }

  private async setRFRollerStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as Rmpro;

    const hexCommandCode = await this.commandsCacheManager.getRFRollerCommand(minion, setStatus) as string;

    await this.sendBeamCommand(broadlink, hexCommandCode);

    await this.commandsCacheManager.cacheLastStatus(minion, setStatus);
  }

  private async setIrAcStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as Rmpro;

    const hexCommandCode = await this.commandsCacheManager.getIrCommand(minion, setStatus) as string;

    await this.sendBeamCommand(broadlink, hexCommandCode);

    for (let index = 0; index < RESEND_BEAM_COMMAND_TIMES; index++) {
      logger.debug(`[broadlinkHandler.fetchDevicesStateInterval] Sleeping a second before re-sending beam command on the ${index}/${RESEND_BEAM_COMMAND_TIMES} attempts`);
      /** In case AC has missed the sent command, send it again. */
      await Delay(moment.duration(1, 'seconds'));
      await this.sendBeamCommand(broadlink, hexCommandCode);
    }

    await this.commandsCacheManager.cacheLastStatus(minion, setStatus);
  }

  private async recordIRACommands(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as Rmpro;

    const hexIRCommand = await this.enterBeamLearningMode(broadlink);

    await this.commandsCacheManager.cacheIRACommand(minion, statusToRecordFor, hexIRCommand);
  }

  private async recordRollerRFCommand(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as Rmpro;
    const hexIRCommand = await this.enterBeamLearningMode(broadlink);
    await this.commandsCacheManager.cacheRFRollerCommand(minion, statusToRecordFor, hexIRCommand);
  }

  private async generateToggleRFCommand(
    minion: Minion,
    statusToRecordFor: MinionStatus,
  ): Promise<void | ErrorResponse> {
    const generatedCode = BroadlinkCodeGeneration.generate('RF433');
    await this.commandsCacheManager.cacheRFToggleCommand(minion, statusToRecordFor, generatedCode);
  }

  private async generateRollerRFCommand(
    minion: Minion,
    statusToRecordFor: MinionStatus,
  ): Promise<void | ErrorResponse> {
    const generatedCode = BroadlinkCodeGeneration.generate('RF433');
    await this.commandsCacheManager.cacheRFRollerCommand(minion, statusToRecordFor, generatedCode);
  }

  private async recordRFToggleCommands(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    // TODO: swap and then record.
    throw {
      responseCode: 5501,
      message: 'Not implemented yet.',
    } as ErrorResponse;
  }

  /** Fetch the SP2's status interval  */
  private async fetchDevicesStateInterval() {
    while (true) {
      try {
        await Delay(moment.duration(30, 'seconds'));

        // get all minions in system
        const minions = await this.retrieveMinions.pull();

        for (const minion of minions) {
          // Look for SP2 only
          if (!(minion.device.brand === this.brandName && minion.device.model === 'SP2')) {
            continue;
          }

          // Get the curr state
          const currStatus = await this.getStatus(minion) as MinionStatus;

          if (minion.minionStatus[minion.minionType].status === currStatus[minion.minionType].status) {
            continue;
          }

          this.minionStatusChangedEvent.post({
            minionId: minion.minionId,
            status: currStatus
          });
        }
      } catch (error) {
        logger.debug(`[broadlinkHandler.fetchDevicesStateInterval] Fetching curr state fail, error : ${JSON.stringify(error)}`);
      }
    }
  }
}
