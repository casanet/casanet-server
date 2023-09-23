import * as fse from 'fs-extra';
import { AcCommands, AirConditioningCommand, CommandsSet, RollerCommands, ToggleCommands } from '../models/backendInterfaces';
import { AirConditioning, ErrorResponse, Minion, MinionStatus } from '../models/sharedInterfaces';
import { logger } from './logger';


export interface CommandsCache {
  minionId: string;
  lastStatus: MinionStatus;
  toggleCommands?: ToggleCommands;
  acCommands?: AcCommands;
  rollerCommands?: RollerCommands;
}

/**
 * A simple json cache implementation to use for any module needs. 
 */
export class CacheManager {
  constructor(private cacheFilePath: string) {

  }

/**
 * Get cache JSON data sync.
 * Use it in init only. else the app will black until read finish.
 */
  public getCacheDataSync(): any {
    try {
      return fse.readJSONSync(this.cacheFilePath);
    } catch (error) {
      return undefined;
    }
  }

/**
 * Get cache JSON data.
 */
  public async getCacheData(): Promise<any> {
    const data = await fse.readJSON(this.cacheFilePath).catch(err => {
      logger.warn(`Fail to read ${this.cacheFilePath} cache file, ${err}`);
      throw new Error('Fail to read cache data');
    });
    return data;
  }

  /**
   * Save JSON to module cache.
   * @param data Data to save in cache.
   */
  public async setCacheData(data: any): Promise<void> {
    await fse.outputFile(this.cacheFilePath, JSON.stringify(data, null, 2)).catch(err => {
      logger.warn(`Fail to write ${this.cacheFilePath} cache file, ${err}`);
      throw new Error('Fail to write cache data');
    });
  }
}

/**
 * Ir/Rf commands cache manager, used to get and update devices commands 
 * and get and update last devices status 
 */
// tslint:disable-next-line: max-classes-per-file
export class CommandsCacheManager extends CacheManager {
  // The commands of a device
  public cache: CommandsCache[] = [];

  constructor(cacheFilePath: string) {
    super(cacheFilePath);
    const cache = super.getCacheDataSync();
    if (cache) {
      this.cache = cache;
    }
  }

  /**
   * Override minion commands with the new fetched commands set
   * @param minion 
   * @param commandsSet 
   */
  public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet) {
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
    await this.saveCache();
  }

 /**
  * Get last status, use in all devices that not holing any data, such as IR transmitter.
  * @param minion minion to get last status for.
  */
  public async getCachedStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    const minionCache = this.getOrCreateMinionCache(minion);
    if (!minionCache.lastStatus) {
      throw {
        responseCode: 5503,
        message: 'Current status is unknown, no history for current one-way transmitter',
      } as ErrorResponse;
    }

    return minionCache.lastStatus;
  }

  public async getRFToggleCommand(minion: Minion, status: MinionStatus): Promise<string | string [] | ErrorResponse> {

    const minionCache = this.getOrCreateMinionCache(minion);

    if (!minionCache.toggleCommands) {
      throw {
        responseCode: 4503,
        message: 'there is no available command. record a on off commands set.',
      } as ErrorResponse;
    }

    const hexCommandCode =
      status.toggle.status === 'on' ? minionCache.toggleCommands.on : minionCache.toggleCommands.off;

    if (!hexCommandCode) {
      throw {
        responseCode: 4503,
        message: 'there is no available command. record a on off commands set.',
      } as ErrorResponse;
    }

    return hexCommandCode;
  }

  public async getRFRollerCommand(minion: Minion, status: MinionStatus): Promise<string | string [] | ErrorResponse> {

    const minionCache = this.getOrCreateMinionCache(minion);

    if (!minionCache.rollerCommands) {
      throw {
        responseCode: 4503,
        message: 'there is no available command. record a roller commands set.',
      } as ErrorResponse;
    }

    const hexCommandCode =
      status.roller.status === 'off' ?
        minionCache.rollerCommands.off :
        status.roller.direction === 'up' ?
          minionCache.rollerCommands.up :
          minionCache.rollerCommands.down;

    if (!hexCommandCode) {
      throw {
        responseCode: 4503,
        message: 'there is no available command. record a roller commands set.',
      } as ErrorResponse;
    }

    return hexCommandCode;
  }

  public async getIrCommand(minion: Minion, setStatus: MinionStatus): Promise<string | string [] | ErrorResponse> {

    const minionCache = this.getOrCreateMinionCache(minion);

    if (!minionCache.acCommands) {
      throw {
        responseCode: 3503,
        message: 'there is no any command',
      } as ErrorResponse;
    }

    let hexCommandCode: string | string [];

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
        message: 'there is no available command for current status. record a new command.',
      } as ErrorResponse;
    }

    return hexCommandCode;
  }

  public async cacheLastStatus(minion: Minion, setStatus: MinionStatus) {
    const minionCache = this.getOrCreateMinionCache(minion);
    minionCache.lastStatus = setStatus;
    await this.saveCache();
  }

  public async cacheIRACommand(minion: Minion, statusToRecordFor: MinionStatus, hexIRCommand: string | string[]): Promise<void | ErrorResponse> {

    const minionCache = this.getOrCreateMinionCache(minion);

    /** If status is off, just save it. */
    if (statusToRecordFor.airConditioning.status === 'off') {
      minionCache.acCommands.off = hexIRCommand;
    } else {
      /** Else, get record object if exist and update command */
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
    await this.saveCache();
  }

  public async cacheRFRollerCommand(minion: Minion, statusToRecordFor: MinionStatus, hexRfCommand: string | string[]): Promise<void | ErrorResponse> {

    const minionCache = this.getOrCreateMinionCache(minion);

    if (!minionCache.rollerCommands) {
      minionCache.rollerCommands = {
        up: '',
        down: '',
        off: '',
      };
    }


    if (statusToRecordFor.roller.status === 'off') {
      minionCache.rollerCommands.off = hexRfCommand;
    } else if (statusToRecordFor.roller.direction === 'up') {
      minionCache.rollerCommands.up = hexRfCommand;
    } else {
      minionCache.rollerCommands.down = hexRfCommand;
    }

    await this.saveCache();
  }

  public async cacheRFToggleCommand(
    minion: Minion,
    statusToRecordFor: MinionStatus,
    hexRfCommand: string
  ): Promise<void | ErrorResponse> {

    const minionCache = this.getOrCreateMinionCache(minion);

    if (!minionCache.toggleCommands) {
      minionCache.toggleCommands = {
        on: undefined,
        off: undefined,
      };
    }

    if (statusToRecordFor.toggle.status === 'on') {
      minionCache.toggleCommands.on = hexRfCommand;
    } else {
      minionCache.toggleCommands.off = hexRfCommand;
    }

    await this.saveCache();
  }

  /** Save the current cache json to the cache json file */
  private async saveCache() {
    try {
      await this.setCacheData(this.cache);
    } catch (error) {

    }
  }

  /**
   * Get minion cache commands and status, if not exists create it.
   * @param minion 
   */
  private getOrCreateMinionCache(minion: Minion): CommandsCache {
    for (const minionCache of this.cache) {
      if (minionCache.minionId === minion.minionId) {
        return minionCache;
      }
    }

    /** Case there is not cache structure for minion, create it */
    const newMinionCache: CommandsCache = {
      minionId: minion.minionId,
      lastStatus: undefined,
    };

    this.cache.push(newMinionCache);
    this.saveCache();
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
}
