"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const deepCopy_1 = require("../utilities/deepCopy");
const logger_1 = require("../utilities/logger");
const sleep_1 = require("../utilities/sleep");
const minionsBl_1 = require("./minionsBl");
const TIMEOUT_INTERVAL_ACTIVATION = moment.duration(5, 'seconds');
/**
 * This class take care on all logic of minions self timeout.
 */
class TimeoutBl {
    /**
     * Init TimeoutBl . using dependecy injection pattern to allow units testings.
     * @param minionsBl Inject minionsBl instance.
     */
    constructor(minionsBl) {
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
    findMinionInfo(minionId) {
        for (const timeoutMinoin of this.minionsTimeoutInfo) {
            if (timeoutMinoin.minionId === minionId) {
                return timeoutMinoin;
            }
        }
    }
    async timeoutActivation() {
        /**
         * get current time.
         */
        const now = new Date();
        /**
         * Cehck each minion info to know if timeout.
         */
        for (const timeoutMinion of this.minionsTimeoutInfo) {
            if (timeoutMinion.isTimeoutDisabled ||
                timeoutMinion.status !== 'on' ||
                now.getTime() - timeoutMinion.turnOnTimeStump.getTime() < timeoutMinion.timeout.asMilliseconds()) {
                continue;
            }
            try {
                logger_1.logger.info(`Minion ${timeoutMinion.minionId} timeout activated`);
                const minion = await this.minionsBl.getMinionById(timeoutMinion.minionId);
                /**
                 * Get minion current status, then copy status *by val*
                 */
                const minionStatus = deepCopy_1.DeepCopy(minion.minionStatus);
                /**
                 * Set status off.
                 */
                minionStatus[minion.minionType].status = 'off';
                await this.minionsBl.setMinionStatus(timeoutMinion.minionId, minionStatus);
                /**
                 * If success set status to 'off'.
                 */
                timeoutMinion.status = 'off';
            }
            catch (error) {
                logger_1.logger.warn(`Fail to set timeout to ${timeoutMinion.minionId} , error ${error.message}`);
            }
            /**
             * Some poor devices protocols need it.
             */
            await sleep_1.Delay(moment.duration(1, 'seconds'));
        }
    }
    /**
     * Get switch (on/off) status of minion.
     * (each minion kind extends toggel so all minions contain 'status' key).
     * @param minion minion to get status from.
     */
    extractMinionOnOffStatus(minion) {
        const switchObject = minion.minionStatus[minion.minionType];
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
    AddMinion(minion) {
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
    UpdateMinion(minion) {
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
    removeMinion(minion) {
        const timeoutMinion = this.findMinionInfo(minion.minionId);
        this.minionsTimeoutInfo.splice(this.minionsTimeoutInfo.indexOf(timeoutMinion), 1);
    }
    async initData() {
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
        logger_1.logger.info('Timeout module init done.');
    }
}
exports.TimeoutBl = TimeoutBl;
exports.TimeoutBlSingleton = new TimeoutBl(minionsBl_1.MinionsBlSingleton);
//# sourceMappingURL=timeoutBl.js.map