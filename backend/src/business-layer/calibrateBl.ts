import * as moment from 'moment';
import { MinionStatus } from '../models/sharedInterfaces';
import { DeepCopy } from '../utilities/deepCopy';
import { logger } from '../utilities/logger';
import { Delay } from '../utilities/sleep';
import { MinionsBl, MinionsBlSingleton } from './minionsBl';

const CALIBRATE_INTERVAL_ACTIVATION = moment.duration(30, 'seconds');

export class CalibrateBl {
  // Dependecies
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
      if (!minion.calibrationCycleMinutes) {
        continue;
      }

      /** If minion calibration time not arrived yet, ignore it. */
      if (
        this.lastCalibrateMap[minion.minionId] &&
        now.getTime() - this.lastCalibrateMap[minion.minionId].getTime() <
          moment.duration(minion.calibrationCycleMinutes, 'minutes').asMilliseconds()
      ) {
        continue;
      }

      /** Calibrate minion status */

      /**
       * Get the minion current status, then copy status *by val*
       */
      const minionStatus = DeepCopy<MinionStatus>(minion.minionStatus);

      try {
        await this.minionsBl.setMinionStatus(minion.minionId, minionStatus);
        logger.debug(`Calibrate minion ${minion.minionId} successfully acvtivated`);
      } catch (error) {
        logger.warn(`Calibrate minion ${minion.minionId} fail, ${JSON.stringify(error)}`);
      }

      /** Then keep the calibrate timestamp */
      this.lastCalibrateMap[minion.minionId] = now;

      /**
       * Some poor devices protocols need it.
       */
      await Delay(moment.duration(1, 'seconds'));
    }
  }

  private async initActivation(): Promise<void> {
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
  }
}

export const CalibrateBlSingleton = new CalibrateBl(MinionsBlSingleton);
