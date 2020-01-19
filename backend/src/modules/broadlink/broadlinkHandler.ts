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

interface Cache {
  minionId: string;
  lastStatus: MinionStatus;
  toggleCommands?: ToggleCommands;
  acCommands?: AcCommands;
  rollerCommands?: RollerCommands;
}

export class BroadlinkHandler extends BrandModuleBase {
  public readonly brandName: string = 'broadlink';

  public readonly devices: DeviceKind[] = [
    {
      brand: this.brandName,
      isTokenRequierd: false,
      isIdRequierd: false,
      minionsPerDevice: 1,
      model: 'SP2',
      suppotedMinionType: 'switch',
      isRecordingSupported: false,
    },
    {
      brand: this.brandName,
      isTokenRequierd: false,
      isIdRequierd: false,
      minionsPerDevice: -1,
      model: 'RM3 / RM Pro as IR AC',
      suppotedMinionType: 'airConditioning',
      isRecordingSupported: true,
    },
    {
      brand: this.brandName,
      isTokenRequierd: false,
      isIdRequierd: false,
      minionsPerDevice: -1,
      model: 'RM Pro as RF toggle',
      suppotedMinionType: 'toggle',
      isRecordingSupported: true,
    },
    {
      brand: this.brandName,
      isTokenRequierd: false,
      isIdRequierd: false,
      minionsPerDevice: -1,
      model: 'RM Pro as RF roller',
      suppotedMinionType: 'roller',
      isRecordingSupported: true,
    },
  ];
  private cache: Cache[] = [];

  constructor() {
    super();
    const cache = super.getCacheDataSync();
    if (cache) {
      this.cache = cache;
    }
  }

  public async getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
    switch (miniom.device.model) {
      case 'SP2':
        return await this.getSP2Status(miniom);
      case 'RM Pro as RF toggle':
      case 'RM3 / RM Pro as IR AC':
      case 'RM Pro as RF roller':
        return await this.getCachedStatus(miniom);
    }
    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    switch (miniom.device.model) {
      case 'SP2':
        return await this.setSP2Status(miniom, setStatus);
      case 'RM Pro as RF toggle':
        return await this.setRFToggleStatus(miniom, setStatus);
      case 'RM3 / RM Pro as IR AC':
        return await this.setIRACStatus(miniom, setStatus);
      case 'RM Pro as RF roller':
        return await this.setRFRollerStatus(miniom, setStatus);
    }
    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    switch (miniom.device.model) {
      case 'RM Pro as RF toggle':
        return await this.recordRFToggleCommands(miniom, statusToRecordFor);
      case 'RM3 / RM Pro as IR AC':
        return await this.recordIRACCommands(miniom, statusToRecordFor);
      case 'RM Pro as RF roller':
        return await this.recordRollerRFCommand(miniom, statusToRecordFor);
    }
    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async generateCommand(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    switch (miniom.device.model) {
      case 'RM Pro as RF toggle':
        return await this.generateToggleRFCommand(miniom, statusToRecordFor);
      case 'RM Pro as RF roller':
        return await this.generateRollerRFCommand(miniom, statusToRecordFor);
    }
    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    const minionCache = this.getOrCreateMinionCache(minion);

    switch (minion.minionType) {
      case 'toggle':
        minionCache.toggleCommands = commandsSet.commands.toggle;
        break;
      case 'airConditioning':
        minionCache.acCommands = commandsSet.commands.airConditioning;
        break;
      case 'roller':
        minionCache.rollerCommands = commandsSet.commands.roller;
        break;
    }
    this.updateCache();
  }

  public async refreshCommunication(): Promise<void> {
    // There's nothing to do.
  }

  private updateCache() {
    this.setCacheData(this.cache)
      .then(() => {})
      .catch(() => {});
  }

  private getOrCreateMinionCache(miniom: Minion): Cache {
    for (const minionCache of this.cache) {
      if (minionCache.minionId === miniom.minionId) {
        return minionCache;
      }
    }

    /** Case there is not cache struct for minion, create it */
    const newMinionCache: Cache = {
      minionId: miniom.minionId,
      lastStatus: undefined,
    };

    this.cache.push(newMinionCache);
    this.updateCache();
    return newMinionCache;
  }

  /**
   * Get IR command (HEX string) for given status. for AC only.
   * @param airConditioningCommands array of all commands to find command in.
   * @param airConditioningStatus The AC status to get command for.
   * @returns IR code struct or undefined if not exist.
   */
  private getMinionACStatusCommand(
    airConditioningCommands: AirConditioningCommand[],
    airConditioningStatus: AirConditioning,
  ): AirConditioningCommand {
    for (const airConditioningCommand of airConditioningCommands) {
      if (
        airConditioningCommand.status.fanStrength === airConditioningStatus.fanStrength &&
        airConditioningCommand.status.mode === airConditioningStatus.mode &&
        airConditioningCommand.status.temperature === airConditioningStatus.temperature
      ) {
        return airConditioningCommand;
      }
    }
  }

  /** Get broadlink protocol handler instance for given minion */
  private async getBroadlinkInstance(minoin: Minion): Promise<BroadlinkAPI | ErrorResponse> {
    return new Promise<BroadlinkAPI | ErrorResponse>((resolve, reject) => {
      const broadlinkDevice = new Broadlink(
        { address: minoin.device.pysicalDevice.ip, port: 80 },
        minoin.device.pysicalDevice.mac,
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
   * @param miniom minion to get last status for.
   */
  private async getCachedStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
    await this.getBroadlinkInstance(miniom);

    const minionCache = this.getOrCreateMinionCache(miniom);
    if (!minionCache.lastStatus) {
      throw {
        responseCode: 5503,
        message: 'Current status is unknown, no history for current one-way transmitter',
      } as ErrorResponse;
    }

    return minionCache.lastStatus;
  }

  private async getSP2Status(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(miniom)) as BroadlinkAPI;

    const status = (await this.getBroadlinkPowerMode(broadlink)) as SwitchOptions;
    return {
      switch: {
        status,
      },
    };
  }

  private async setSP2Status(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(miniom)) as BroadlinkAPI;

    await this.setBroadlinkPowerMode(broadlink, setStatus.switch.status);
  }

  private async setRFToggleStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(miniom)) as BroadlinkAPI;

    const minionCache = this.getOrCreateMinionCache(miniom);

    if (!minionCache.toggleCommands) {
      throw {
        responseCode: 4503,
        message: 'there is no availble command. record a on off commands set.',
      } as ErrorResponse;
    }

    const hexCommandCode =
      setStatus.toggle.status === 'on' ? minionCache.toggleCommands.on : minionCache.toggleCommands.off;

    if (!hexCommandCode) {
      throw {
        responseCode: 4503,
        message: 'there is no availble command. record a on off commands set.',
      } as ErrorResponse;
    }
    await this.sendBeamCommand(broadlink, hexCommandCode);

    minionCache.lastStatus = setStatus;
    this.updateCache();
  }

  private async setRFRollerStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(miniom)) as BroadlinkAPI;

    const minionCache = this.getOrCreateMinionCache(miniom);

    if (!minionCache.rollerCommands) {
      throw {
        responseCode: 4503,
        message: 'there is no availble command. record a roller commands set.',
      } as ErrorResponse;
    }

    const hexCommandCode =
      setStatus.roller.status === 'off'
        ? minionCache.rollerCommands.off
        : setStatus.roller.direction === 'up'
        ? minionCache.rollerCommands.up
        : minionCache.rollerCommands.down;

    if (!hexCommandCode) {
      throw {
        responseCode: 4503,
        message: 'there is no availble command. record a roller commands set.',
      } as ErrorResponse;
    }

    await this.sendBeamCommand(broadlink, hexCommandCode);

    minionCache.lastStatus = setStatus;
    this.updateCache();
  }

  private async setIRACStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(miniom)) as BroadlinkAPI;

    const minionCache = this.getOrCreateMinionCache(miniom);

    if (!minionCache.acCommands) {
      throw {
        responseCode: 3503,
        message: 'there is no any command',
      } as ErrorResponse;
    }

    let hexCommandCode: string;

    /**
     * If the request is to set off, get the off command.
     */
    if (setStatus.airConditioning.status === 'off') {
      hexCommandCode = minionCache.acCommands.off;
    } else {
      /**
       * Else try to get the correct command for given status to set.
       */
      const acCommand = this.getMinionACStatusCommand(minionCache.acCommands.statusCommands, setStatus.airConditioning);

      /** If there is command, get it. */
      hexCommandCode = acCommand ? acCommand.command : '';
    }

    if (!hexCommandCode) {
      throw {
        responseCode: 4503,
        message: 'there is no availble command for current status. record a new command.',
      } as ErrorResponse;
    }

    await this.sendBeamCommand(broadlink, hexCommandCode);
    /** In case AC has missed the sent command, send it again. */
    await Delay(moment.duration(1, 'seconds'));
    await this.sendBeamCommand(broadlink, hexCommandCode);

    minionCache.lastStatus = setStatus;
    this.updateCache();
  }

  private async recordIRACCommands(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(miniom)) as BroadlinkAPI;

    const minionCache = this.getOrCreateMinionCache(miniom);

    if (!minionCache.acCommands) {
      minionCache.acCommands = {
        off: '',
        statusCommands: [],
      };
    }

    const hexIRCommand = await this.enterBeamLearningMode(broadlink);

    /** If status is off, jusr save it. */
    if (statusToRecordFor.airConditioning.status === 'off') {
      minionCache.acCommands.off = hexIRCommand;
    } else {
      /** Else, get record objec if exsit and update command */
      let statusCommand = this.getMinionACStatusCommand(
        minionCache.acCommands.statusCommands,
        statusToRecordFor.airConditioning,
      );

      /** If command object not exist yet, create new one and add it to commands array */
      if (!statusCommand) {
        statusCommand = {
          command: '',
          status: statusToRecordFor.airConditioning,
        };
        minionCache.acCommands.statusCommands.push(statusCommand);
      }

      statusCommand.command = hexIRCommand;
    }
    this.updateCache();
  }

  private async recordRollerRFCommand(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    const broadlink = (await this.getBroadlinkInstance(miniom)) as BroadlinkAPI;

    const minionCache = this.getOrCreateMinionCache(miniom);

    if (!minionCache.rollerCommands) {
      minionCache.rollerCommands = {
        up: '',
        down: '',
        off: '',
      };
    }

    const hexIRCommand = await this.enterBeamLearningMode(broadlink);

    if (statusToRecordFor.roller.status === 'off') {
      minionCache.rollerCommands.off = hexIRCommand;
    } else if (statusToRecordFor.roller.direction === 'up') {
      minionCache.rollerCommands.up = hexIRCommand;
    } else {
      minionCache.rollerCommands.down = hexIRCommand;
    }

    this.updateCache();
  }

  private async generateToggleRFCommand(
    miniom: Minion,
    statusToRecordFor: MinionStatus,
  ): Promise<void | ErrorResponse> {
    const generatedCode = BroadlinkCodeGeneration.generate('RF433');

    const minionCache = this.getOrCreateMinionCache(miniom);

    if (!minionCache.toggleCommands) {
      minionCache.toggleCommands = {
        on: undefined,
        off: undefined,
      };
    }

    if (statusToRecordFor.toggle.status === 'on') {
      minionCache.toggleCommands.on = generatedCode;
    } else {
      minionCache.toggleCommands.off = generatedCode;
    }

    this.updateCache();
  }

  private async generateRollerRFCommand(
    minion: Minion,
    statusToRecordFor: MinionStatus,
  ): Promise<void | ErrorResponse> {
    const generatedCode = BroadlinkCodeGeneration.generate('RF433');

    const minionCache = this.getOrCreateMinionCache(minion);

    if (!minionCache.rollerCommands) {
      minionCache.rollerCommands = {
        down: undefined,
        up: undefined,
        off: undefined,
      };
    }

    if (statusToRecordFor.roller.status === 'off') {
      minionCache.rollerCommands.off = generatedCode;
    } else if (statusToRecordFor.roller.direction === 'up') {
      minionCache.rollerCommands.up = generatedCode;
    } else {
      minionCache.rollerCommands.down = generatedCode;
    }

    this.updateCache();
  }

  private async recordRFToggleCommands(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    // TODO: swap and then record.
    throw {
      responseCode: 5501,
      message: 'Not implemented yet.',
    } as ErrorResponse;
  }
}
