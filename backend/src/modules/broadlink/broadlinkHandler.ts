import * as moment from 'moment';
import { Duration } from 'moment';
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
import { Delay } from '../../utilities/sleep';
import { BrandModuleBase } from '../brandModuleBase';

// tslint:disable-next-line:no-var-requires
const Broadlink = require('./broadlinkProtocol');
// tslint:disable-next-line:no-var-requires
const BroadlinkCodeGeneration = require('./commands-generator');

/** Represents the broadlink protocol handler API */
interface BroadlinkAPI {
  sendData: (hexCommandCode: string, callback: (err: any) => void) => void;
  enterLearning: (timeoutDurationInMs: number, callback: (err: any, hexStringCommand: string) => void) => void;
  checkPower: (callback: (err: any, status: boolean) => void) => void;
  setPower: (status: boolean, callback: (err: any) => void) => void;
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
  private async getBroadlinkInstance(minion: Minion): Promise<BroadlinkAPI | ErrorResponse> {
    return new Promise<BroadlinkAPI | ErrorResponse>((resolve, reject) => {
      const broadlinkDevice = new Broadlink(
        { address: minion.device.pysicalDevice.ip, port: 80 },
        minion.device.pysicalDevice.mac,
        err => {
          if (err) {
            reject({
              responseCode: 1503,
              message: 'Connection to device fail',
            } as ErrorResponse);
            return;
          }

          resolve(broadlinkDevice);
        },
      );
    });
  }

  /** Send RF/IR command */
  private async sendBeamCommand(broadlink: BroadlinkAPI, beamCommand: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      broadlink.sendData(beamCommand, err => {
        if (err) {
          reject({
            responseCode: 11503,
            message: 'Sending beam command fail.',
          } as ErrorResponse);
          return;
        }
        resolve();
      });
    });
  }

  /** Enter learn mode */
  private async enterBeamLearningMode(broadlink: BroadlinkAPI): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      broadlink.enterLearning(moment.duration(5, 'seconds').asMilliseconds(), (err, hexStringCommand) => {
        if (err) {
          reject({
            responseCode: 2503,
            message: 'Recording fail or timeout',
          } as ErrorResponse);
          return;
        }
        resolve(hexStringCommand);
      });
    });
  }

  /** Get current broadlink power */
  private async getBroadlinkPowerMode(broadlink: BroadlinkAPI): Promise<SwitchOptions | ErrorResponse> {
    return new Promise<SwitchOptions | ErrorResponse>((resolve, reject) => {
      broadlink.checkPower((err, state) => {
        if (err) {
          reject({
            responseCode: 7503,
            message: 'Getting status fail',
          } as ErrorResponse);
          return;
        }
        resolve(state ? 'on' : 'off');
      });
    });
  }

  /** Set broadlink power */
  private async setBroadlinkPowerMode(
    broadlink: BroadlinkAPI,
    switchOptions: SwitchOptions,
  ): Promise<void | ErrorResponse> {
    return new Promise<void | ErrorResponse>((resolve, reject) => {
      broadlink.setPower(switchOptions === 'on', err => {
        if (err) {
          reject({
            responseCode: 6503,
            message: 'Setting status fail',
          } as ErrorResponse);
          return;
        }
        resolve();
      });
    });
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
    const broadlink = (await this.getBroadlinkInstance(minion)) as BroadlinkAPI;

    const status = (await this.getBroadlinkPowerMode(broadlink)) as SwitchOptions;
    return {
      switch: {
        status,
      },
    };
  }

  private async setSP2Status(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as BroadlinkAPI;

    await this.setBroadlinkPowerMode(broadlink, setStatus.switch.status);
  }

  private async setRFToggleStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as BroadlinkAPI;

    const hexCommandCode = await this.commandsCacheManager.getRFToggleCommand(minion, setStatus) as string;

    await this.sendBeamCommand(broadlink, hexCommandCode);

    await this.commandsCacheManager.cacheLastStatus(minion, setStatus);
  }

  private async setRFRollerStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as BroadlinkAPI;

    const hexCommandCode = await this.commandsCacheManager.getRFRollerCommand(minion, setStatus) as string;

    await this.sendBeamCommand(broadlink, hexCommandCode);

    await this.commandsCacheManager.cacheLastStatus(minion, setStatus);
  }

  private async setIrAcStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as BroadlinkAPI;

    const hexCommandCode = await this.commandsCacheManager.getIrCommand(minion, setStatus) as string;

    await this.sendBeamCommand(broadlink, hexCommandCode);
    /** In case AC has missed the sent command, send it again. */
    await Delay(moment.duration(1, 'seconds'));
    await this.sendBeamCommand(broadlink, hexCommandCode);

    await this.commandsCacheManager.cacheLastStatus(minion, setStatus);
  }

  private async recordIRACommands(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as BroadlinkAPI;

    const hexIRCommand = await this.enterBeamLearningMode(broadlink);

    await this.commandsCacheManager.cacheIRACommand(minion, statusToRecordFor, hexIRCommand);
  }

  private async recordRollerRFCommand(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(minion)) as BroadlinkAPI;
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
