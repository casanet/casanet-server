"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const logger_1 = require("../utilities/logger");
const sleep_1 = require("../utilities/sleep");
const minionsBl_1 = require("./minionsBl");
const deepCopy_1 = require("../utilities/deepCopy");
const CALIBRATE_INTERVAL_ACTIVATION = moment.duration(30, 'seconds');
class CalibrateBl {
    /**
     * Init CalibrateBl . using dependecy injection pattern to allow units testings.
     * @param minionsBl Inject minionsBl instance.
     */
    constructor(minionsBl) {
        /** Map last minion calibrate timestamp */
        this.lastCalibrateMap = {};
        this.minionsBl = minionsBl;
        /**
         * Init module.
         */
        this.initActivation();
    }
    async calibrateActivation() {
        const now = new Date();
        for (const minion of await this.minionsBl.getMinions()) {
            /** If minion set calibrate to off (undefined/0), pass it. */
            if (!minion.calibrationCycleMinutes) {
                continue;
            }
            /** If minion calibration time not arrived yet, ignore it. */
            if (this.lastCalibrateMap[minion.minionId] &&
                now.getTime() - this.lastCalibrateMap[minion.minionId].getTime() < moment.duration(minion.calibrationCycleMinutes, 'minutes').asMilliseconds()) {
                continue;
            }
            /** Calibrate minion status */
            /**
             * Get the minion current status, then copy status *by val*
             */
            const minionStatus = deepCopy_1.DeepCopy(minion.minionStatus);
            try {
                await this.minionsBl.setMinionStatus(minion.minionId, minionStatus);
                logger_1.logger.debug(`Calibrate minion ${minion.minionId} successfully acvtivated`);
            }
            catch (error) {
                logger_1.logger.warn(`Calibrate minion ${minion.minionId} fail, ${JSON.stringify(error)}`);
            }
            /** Then keep the calibrate timestamp */
            this.lastCalibrateMap[minion.minionId] = now;
            /**
             * Some poor devices protocols need it.
             */
            await sleep_1.Delay(moment.duration(1, 'seconds'));
        }
    }
    async initActivation() {
        /**
         * Finally start timeout activation
         */
        setInterval(async () => {
            try {
                await this.calibrateActivation();
            }
            catch (error) {
                logger_1.logger.error(`Invoking calibration on minions fail, ${JSON.stringify(error)}`);
            }
        }, CALIBRATE_INTERVAL_ACTIVATION.asMilliseconds());
        logger_1.logger.info('Calibrate module init done.');
    }
}
exports.CalibrateBl = CalibrateBl;
exports.CalibrateBlSingleton = new CalibrateBl(minionsBl_1.MinionsBlSingleton);
//# sourceMappingURL=calibrateBl.js.map