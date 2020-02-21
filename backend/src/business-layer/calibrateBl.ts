import * as moment from 'moment';
import { CalibrationMode, Minion, MinionFeed, MinionStatus, SwitchOptions } from '../models/sharedInterfaces';
import { DeepCopy } from '../utilities/deepCopy';
import { logger } from '../utilities/logger';
import { Delay } from '../utilities/sleep';
import { MinionsBl, MinionsBlSingleton } from './minionsBl';

const CALIBRATE_INTERVAL_ACTIVATION = moment.duration(30, 'seconds');

class CalibrateBl {
  // Dependencies
  private minionsBl: MinionsBl;

  /** Map last minion calibrate timestamp */
  private lastCalibrateMap: { [key: string]: Date } = {};

  /**
   * Init CalibrateBl . using dependecy injection pattern to allow units testings.
   * @param minionsBl Inject minionsBl instance.
   */
  constructor(minionsBl: MinionsBl) {
    this.minionsBl = minionsBl;

    /**
     * Init module.
     */
    this.initActivation();
  }

  private async calibrateActivation(): Promise<void> {
    const now = new Date();

    for (const minion of await this.minionsBl.getMinions()) {
      /** If minion set calibrate to off (undefined/0), pass it. */
      if (!minion.calibration || !minion.calibration.calibrationCycleMinutes) {
        continue;
      }

      /** If minion calibration time not arrived yet, ignore it. */
      if (
        this.lastCalibrateMap[minion.minionId] &&
        now.getTime() - this.lastCalibrateMap[minion.minionId].getTime() <
          moment.duration(minion.calibration.calibrationCycleMinutes, 'minutes').asMilliseconds()
      ) {
        continue;
      }

      /** Calibrate minion status */
      await this.calibrateMinion(minion);

      /** Then keep the calibrate timestamp */
      this.lastCalibrateMap[minion.minionId] = now;

      /**
       * Some poor devices protocols need it.
       */
      await Delay(moment.duration(1, 'seconds'));
    }
  }

  private async calibrateMinion(minion: Minion) {
    /**
     * Get the minion current status, then copy status *by val*
     */
    const minionStatus = DeepCopy<MinionStatus>(minion.minionStatus);

    switch (minion.calibration.calibrationMode) {
      case 'LOCK_ON':
        minionStatus[minion.minionType].status = 'on';
        break;
      case 'LOCK_OFF':
        minionStatus[minion.minionType].status = 'off';
        break;
      default:
        break;
    }

    try {
      await this.minionsBl.setMinionStatus(minion.minionId, minionStatus);
      logger.debug(`Calibrate minion ${minion.minionId} successfully acvtivated`);
    } catch (error) {
      logger.warn(`Calibrate minion ${minion.minionId} fail, ${JSON.stringify(error)}`);
    }
  }

  private initActivation() {
    /**
     * Finally start timeout activation
     */
    setInterval(async () => {
      try {
        await this.calibrateActivation();
      } catch (error) {
        logger.error(`Invoking calibration on minions fail, ${JSON.stringify(error)}`);
      }
    }, CALIBRATE_INTERVAL_ACTIVATION.asMilliseconds());

    logger.info('Calibrate module init done.');

    /**
     * If a status update arrived from the physical devices that not match the current
     * LOCK value, sent back the LOCKed status.
     */
    this.minionsBl.minionFeed.subscribe((minionFeed: MinionFeed) => {
      if (!minionFeed || minionFeed.event !== 'update') {
        return;
      }

      const minion = minionFeed.minion;

      // Continue only if minion have a calibration property.
      if (!minion.calibration || !minion.calibration.calibrationCycleMinutes) {
        return;
      }

      // Calibrate only in case the update are violated the lock.

      let legalStatus: SwitchOptions = 'on';
      switch (minion.calibration.calibrationMode) {
        case 'LOCK_ON':
          legalStatus = 'on';
          break;
        case 'LOCK_OFF':
          legalStatus = 'off';
          break;
        case 'AUTO':
          legalStatus = minion.minionStatus[minion.minionType].status;
          break;
        default:
          break;
      }

      // Only if the update is violated the lock
      if (legalStatus === minion.minionStatus[minion.minionType].status) {
        return;
      }

      this.calibrateMinion(minion);
    });
  }
}

export const CalibrateBlSingleton = new CalibrateBl(MinionsBlSingleton);
