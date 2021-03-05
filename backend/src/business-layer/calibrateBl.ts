import * as moment from 'moment';
import { Minion, MinionFeed, MinionStatus, SwitchOptions } from '../models/sharedInterfaces';
import { DeepCopy } from '../utilities/deepCopy';
import { logger } from '../utilities/logger';
import { Delay } from '../utilities/sleep';
import { MinionsBl, MinionsBlSingleton } from './minionsBl';

const CALIBRATE_INTERVAL_ACTIVATION = moment.duration(30, 'seconds');

export class CalibrateBl {
  // Dependencies
  private minionsBl: MinionsBl;

  /** Map last minion calibrate timestamp */
  private lastCalibrateMap: { [key: string]: Date } = {};

  /**
   * Init CalibrateBl . using dependency injection pattern to allow units testings.
   * @param minionsBl Inject minionsBl instance.
   */
  constructor(minionsBl: MinionsBl) {
    this.minionsBl = minionsBl;
  }

  public async initCalibrateModule() {
    /**
     * start timeout activation
     */
    setInterval(async () => {
      try {
        await this.calibrateActivation();
      } catch (error) {
        logger.error(`Invoking calibration on minions fail, ${error}`);
      }
    }, CALIBRATE_INTERVAL_ACTIVATION.asMilliseconds());

    logger.info('Calibrate module init done.');

    /**
     * If a status update arrived from the physical devices that not match the current
     * LOCK value, sent back the LOCKed status.
     */
    this.minionsBl.minionFeed.subscribe(async (minionFeed: MinionFeed) => {
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
        case 'SHABBAT':
          legalStatus = minion.minionStatus[minion.minionType]?.status || 'on';
          break;
        default:
          break;
      }

      // Only if the update is violated the lock
      if (legalStatus === minion.minionStatus[minion.minionType]?.status || 'on') {
        return;
      }

      // Wait in case the device don't like quick status changes
      await Delay(moment.duration(1, 'seconds'));

      this.calibrateMinion(minion);
    });
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
    // In case that minion don't have any status
    const emptyStatus: MinionStatus = {};
    emptyStatus[minion.minionType] = ({} as unknown) as any;
    emptyStatus[minion.minionType].status = 'off';

    /**
     * Get the minion current status, then copy status *by val*
     */
    const minionStatus = DeepCopy<MinionStatus>(minion.minionStatus || emptyStatus);

    switch (minion.calibration.calibrationMode) {
      case 'LOCK_ON':
        minionStatus[minion.minionType].status = 'on';
        break;
      case 'LOCK_OFF':
        minionStatus[minion.minionType].status = 'off';
        break;
      case 'SHABBAT':
        minionStatus[minion.minionType].status = minionStatus[minion.minionType].status === 'off' ? 'on' : 'off';
        break;
      default:
        break;
    }

    try {
      logger.debug(`[CalibrateBl.calibrateMinion] Setting minion "${minion.minionId}" status "${JSON.stringify(minionStatus)}" ...`);
      await this.minionsBl.setMinionStatus(minion.minionId, minionStatus);
      logger.debug(`[CalibrateBl.calibrateMinion] Setting minion ${minion.minionId} calibration successfully activated`);
    } catch (error) {
      logger.warn(`Calibrate minion ${minion.minionId} fail, ${JSON.stringify(error)}`);
    }
  }
}

export const CalibrateBlSingleton = new CalibrateBl(MinionsBlSingleton);
