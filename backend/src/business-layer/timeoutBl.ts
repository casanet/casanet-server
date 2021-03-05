import * as moment from 'moment';
import {
  // tslint:disable-next-line:ordered-imports
  Minion,
  MinionStatus,
  Switch,
  SwitchOptions,
  Toggle,
} from '../models/sharedInterfaces';
import { DeepCopy } from '../utilities/deepCopy';
import { logger } from '../utilities/logger';
import { Delay } from '../utilities/sleep';
import { MinionsBl, MinionsBlSingleton } from './minionsBl';

const TIMEOUT_INTERVAL_ACTIVATION = moment.duration(50, 'milliseconds');

/**
 * Structure to hold info about any minion in system.
 */
declare interface MinionTimeoutStructure {
  isTimeoutDisabled: boolean;
  timeout: moment.Duration;
  status: SwitchOptions;
  turnOnTimeStump: Date;
  minionId: string;
}

/**
 * This class take care on all logic of minions self timeout.
 */
export class TimeoutBl {
  // Dependencies
  private minionsBl: MinionsBl;

  /**
   * Info about all minion in system.
   */
  private minionsTimeoutInfo: MinionTimeoutStructure[];

  /**
   * Is timeout works now (used as flag to not allow parallel check)
   */
  private isTimeoutPossessing: boolean = false;


  /**
   * Init TimeoutBl . using dependency injection pattern to allow units testings.
   * @param minionsBl Inject minionsBl instance.
   */
  constructor(minionsBl: MinionsBl) {
    this.minionsBl = minionsBl;
  }

  public async initTimeoutModule(): Promise<void> {
    this.minionsTimeoutInfo = [];

    /**
     * First get all exist minions
     */
    const rawMinions = await this.minionsBl.getMinions();
    for (const minion of rawMinions) {
      /**
       * Call to *update* method.
       * in case the new minion will arrived *before* current code line.
       */
      this.UpdateMinion(minion);
    }

    /**
     * Then register to changes feed.
     */
    this.minionsBl.minionFeed.subscribe(minionFeed => {
      if (!minionFeed) {
        return;
      }

      switch (minionFeed.event) {
        case 'created':
        case 'update':
          this.UpdateMinion(minionFeed.minion);
          break;
        case 'removed':
          this.removeMinion(minionFeed.minion);
          break;
      }
    });

    /**
     * Finally start timeout activation
     */
    setInterval(async () => {
      await this.timeoutActivation();
    }, TIMEOUT_INTERVAL_ACTIVATION.asMilliseconds());

    logger.info('Timeout module init done.');
  }

  /**
   * Get minion info sturuct if exist for given minion id.
   * @param minionId minion id to get info for.
   */
  private findMinionInfo(minionId: string): MinionTimeoutStructure {
    for (const timeoutMinion of this.minionsTimeoutInfo) {
      if (timeoutMinion.minionId === minionId) {
        return timeoutMinion;
      }
    }
  }

  private async timeoutActivation(): Promise<void> {

    // If currently the timeoutActivation in action, ignore other calls
    if(this.isTimeoutPossessing){
      return;
    }

    // turn timeoutActivation in action flag on
    this.isTimeoutPossessing = true;

    /**
     * get current time.
     */
    const now = new Date();

    /**
     * Check each minion info to know if timeout.
     */
    for (const timeoutMinion of this.minionsTimeoutInfo) {
      if (
        timeoutMinion.isTimeoutDisabled ||
        timeoutMinion.status !== 'on' ||
        now.getTime() - timeoutMinion.turnOnTimeStump.getTime() < timeoutMinion.timeout.asMilliseconds()
      ) {
        continue;
      }

      try {
        const minion = await this.minionsBl.getMinionById(timeoutMinion.minionId);

        /**
         * Get minion current status, then copy status *by val*
         */
        const minionStatus = DeepCopy<MinionStatus>(minion.minionStatus);

        /**
         * Set status off.
         */
        minionStatus[minion.minionType].status = 'off';

        logger.debug(`[TimeoutBl.timeoutActivation] Setting minion "${minion.minionId}" status "${JSON.stringify(minionStatus)}" ...`);
        await this.minionsBl.setMinionStatus(timeoutMinion.minionId, minionStatus);
        logger.debug(`[TimeoutBl.timeoutActivation] Setting minion ${minion.minionId} timeout successfully activated`);

        /**
         * If success set status to 'off'.
         */
        timeoutMinion.status = 'off';
      } catch (error) {
        logger.warn(`Fail to set timeout to ${timeoutMinion.minionId} , error ${error.message}`);
      }

      /**
       * Some poor devices protocols need it.
       */
      await Delay(moment.duration(100, 'milliseconds'));
    }

    // turn timeoutActivation in action flag off
    this.isTimeoutPossessing = false;
  }

  /**
   * Get switch (on/off) status of minion.
   * (each minion kind extends toggel so all minions contain 'status' key).
   * @param minion minion to get status from.
   */
  private extractMinionOnOffStatus(minion: Minion): SwitchOptions {
    const switchObject = minion.minionStatus[minion.minionType] as Toggle;

    /**
     * New minion some time arrived without any status.
     */
    if (!switchObject) {
      return;
    }
    return switchObject.status;
  }

  /**
   * Add new minion to minions timeout info system.
   * @param minion new minion to add.
   */
  private AddMinion(minion: Minion) {
    this.minionsTimeoutInfo.push({
      minionId: minion.minionId,
      isTimeoutDisabled: !minion.minionAutoTurnOffMS || minion.minionAutoTurnOffMS < 1,
      timeout: moment.duration(minion.minionAutoTurnOffMS, 'milliseconds'),
      status: this.extractMinionOnOffStatus(minion),
      turnOnTimeStump: new Date(),
    });
  }

  /**
   * Update minion timeout info system.
   * @param minion minion to update from.
   */
  private UpdateMinion(minion: Minion) {
    const timeoutMinion = this.findMinionInfo(minion.minionId);

    if (!timeoutMinion) {
      this.AddMinion(minion);
      return;
    }

    timeoutMinion.isTimeoutDisabled = !minion.minionAutoTurnOffMS || minion.minionAutoTurnOffMS < 1;
    timeoutMinion.timeout = moment.duration(minion.minionAutoTurnOffMS, 'milliseconds');

    const currentStatus = this.extractMinionOnOffStatus(minion);

    /**
     * If the status changed to *on* save the timestamp.
     */
    if (currentStatus !== timeoutMinion.status && currentStatus === 'on') {
      timeoutMinion.turnOnTimeStump = new Date();
    }

    timeoutMinion.status = currentStatus;
  }

  /**
   * Remove minion timeout info from system.
   * @param minion minion to remove.
   */
  private removeMinion(minion: Minion) {
    const timeoutMinion = this.findMinionInfo(minion.minionId);
    this.minionsTimeoutInfo.splice(this.minionsTimeoutInfo.indexOf(timeoutMinion), 1);
  }
}

export const TimeoutBlSingleton = new TimeoutBl(MinionsBlSingleton);
