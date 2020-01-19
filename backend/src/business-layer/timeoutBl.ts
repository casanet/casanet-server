import * as moment from 'moment';
import { Moment } from 'moment';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
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

const TIMEOUT_INTERVAL_ACTIVATION = moment.duration(5, 'seconds');

/**
 * Struct to hold info about any minion in system.
 */
declare interface MinionTimeoutStruct {
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
  // Dependecies
  private minionsBl: MinionsBl;

  /**
   * Info about all minios in system.
   */
  private minionsTimeoutInfo: MinionTimeoutStruct[];

  /**
   * Init TimeoutBl . using dependecy injection pattern to allow units testings.
   * @param minionsBl Inject minionsBl instance.
   */
  constructor(minionsBl: MinionsBl) {
    this.minionsBl = minionsBl;

    /**
     * Init module.
     */
    this.initData();
  }

  /**
   * Get minion info sturuct if exsit for given minion id.
   * @param minionId minion id to get info for.
   */
  private findMinionInfo(minionId: string): MinionTimeoutStruct {
    for (const timeoutMinoin of this.minionsTimeoutInfo) {
      if (timeoutMinoin.minionId === minionId) {
        return timeoutMinoin;
      }
    }
  }

  private async timeoutActivation(): Promise<void> {
    /**
     * get current time.
     */
    const now = new Date();

    /**
     * Cehck each minion info to know if timeout.
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
        logger.info(`Minion ${timeoutMinion.minionId} timeout activated`);
        const minion = await this.minionsBl.getMinionById(timeoutMinion.minionId);

        /**
         * Get minion current status, then copy status *by val*
         */
        const minionStatus = DeepCopy<MinionStatus>(minion.minionStatus);

        /**
         * Set status off.
         */
        minionStatus[minion.minionType].status = 'off';
        await this.minionsBl.setMinionStatus(timeoutMinion.minionId, minionStatus);

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
      await Delay(moment.duration(1, 'seconds'));
    }
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
   * Add new minoin to minions timeout info system.
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
   * Update minoin timeout info system.
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
     * If the status changed to *on* save the timestump.
     */
    if (currentStatus !== timeoutMinion.status && currentStatus === 'on') {
      timeoutMinion.turnOnTimeStump = new Date();
    }

    timeoutMinion.status = currentStatus;
  }

  /**
   * Remove minoin timeout info from system.
   * @param minion minion to remove.
   */
  private removeMinion(minion: Minion) {
    const timeoutMinion = this.findMinionInfo(minion.minionId);
    this.minionsTimeoutInfo.splice(this.minionsTimeoutInfo.indexOf(timeoutMinion), 1);
  }

  private async initData(): Promise<void> {
    this.minionsTimeoutInfo = [];

    /**
     * First get all exist minions
     */
    const rawMinions = await this.minionsBl.getMinions();
    for (const minion of rawMinions) {
      /**
       * Call to *update* method.
       * in case the new minion will arrived *befor* current code line.
       */
      this.UpdateMinion(minion);
    }

    /**
     * Then registar to changes feed.
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
}

export const TimeoutBlSingleton = new TimeoutBl(MinionsBlSingleton);
