"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const randomstring = require("randomstring");
const rxjs_1 = require("rxjs");
const suncalc = require("suncalc");
const config_1 = require("../config");
const timingsDal_1 = require("../data-layer/timingsDal");
const logger_1 = require("../utilities/logger");
const operationsBl_1 = require("./operationsBl");
const TIMING_INTERVAL_ACTIVATION = moment.duration(5, 'seconds');
class TimingsBl {
    /**
     * Init TimingsBl . using dependecy injection pattern to allow units testings.
     * @param timingsDal Inject timings dal.
     * @param localNetworkReader Inject the reader function.
     */
    constructor(timingsDal, operationBl) {
        /**
         * Timing trigger feed.
         */
        this.timingFeed = new rxjs_1.BehaviorSubject(undefined);
        /**
         * The real avtivation is in minute.
         * So only if minute changed trigger the timing logic.
         */
        this.lastActivationMoment = moment(1);
        this.timingsDal = timingsDal;
        this.operationBl = operationBl;
        setInterval(async () => {
            await this.timingActivation();
        }, TIMING_INTERVAL_ACTIVATION.asMilliseconds());
    }
    /**
     * API
     */
    /**
     * Get all timings array.
     */
    async getTimings() {
        return await this.timingsDal.getTimings();
    }
    /**
     * Get timing by id.
     * @param timingId timing id.
     */
    async getTimingById(timingId) {
        return await this.timingsDal.getTimingById(timingId);
    }
    /**
     * Set timing properties.
     * @param timingId timing id.
     * @param timing timing props to set.
     */
    async SetTiming(timingId, timing) {
        await this.validateNewTimingOperation(timing);
        timing.timingId = timingId;
        return await this.timingsDal.updateTiming(timing);
    }
    /**
     * Create timing.
     * @param timing timing to create.
     */
    async CreateTiming(timing) {
        await this.validateNewTimingOperation(timing);
        /**
         * Generate new id. (never trust client....)
         */
        timing.timingId = randomstring.generate(6);
        return await this.timingsDal.createTiming(timing);
    }
    /**
     * Delete timing.
     * @param timingId timing id to delete.
     */
    async DeleteTiming(timingId) {
        return await this.timingsDal.deleteTiming(timingId);
    }
    /**
     * Active timing.
     * @param timing timing to active.
     */
    async activeTiming(timing) {
        logger_1.logger.info(`Invoke ${timing.timingName} id: ${timing.timingId} timing starting...`);
        try {
            const results = await this.operationBl.triggerOperation(timing.triggerOperationId);
            logger_1.logger.info(`Invoke ${timing.timingName} id: ${timing.timingId} timing done`);
            this.timingFeed.next({
                timing,
                results,
            });
        }
        catch (error) {
            logger_1.logger.warn(`Invoke timing ${timing.timingName}` +
                ` id: ${timing.timingId}` +
                ` operationId: ${timing.triggerOperationId} fail, ${error.message}`);
        }
    }
    /**
     * Handle One timing.
     * Check if time to trigger, and if so, trigger it.
     * @param now now.
     * @param timing timing to check.
     * @param timingProperties Once timing properties.
     */
    async onceTiming(now, timing, timingProperties) {
        const timingMoment = moment(timingProperties.date);
        if (now.isSame(timingMoment, 'minute')) {
            await this.activeTiming(timing);
        }
    }
    /**
     * Check if day exist in timing days.
     * @param now now.
     * @param dailyProperties daily timing properties to get days array from.
     */
    isInWeek(now, dailyProperties) {
        return dailyProperties.days.indexOf(now.format('dddd').toLowerCase()) !== -1;
    }
    /**
     * Handle Sun trigger timing.
     * Check if its time to trigger, and if so, trigger it.
     * @param now now.
     * @param timing timing to check.
     * @param timingProperties SunTrigger timing properties.
     */
    async dailySunTiming(now, timing, timingProperties) {
        /**
         * Only id today marked in timing props.
         */
        if (!this.isInWeek(now, timingProperties)) {
            return;
        }
        /**
         * Get sun info.
         */
        const sunTimes = suncalc.getTimes(new Date(), config_1.Configuration.homePosition.latitude, config_1.Configuration.homePosition.longitude);
        /**
         * Get sun trigger moment.
         */
        let sunTriggerMoment;
        if (timingProperties.sunTrigger === 'sunrise') {
            sunTriggerMoment = moment(sunTimes.sunrise);
        }
        else {
            sunTriggerMoment = moment(sunTimes.sunset);
        }
        /**
         * Add / sub minuts of duration from sun trigger.
         */
        sunTriggerMoment.add(timingProperties.durationMinutes, 'minutes');
        /**
         * If its new trigger timing.
         */
        if (now.isSame(sunTriggerMoment, 'minute')) {
            await this.activeTiming(timing);
        }
    }
    /**
     * Handle Day time trigger timing.
     * Check if its time to trigger, and if so, trigger it.
     * @param now now.
     * @param timing timing to check.
     * @param timingProperties TimeTrigger timing properties.
     */
    async dailyTimeTiming(now, timing, timingProperties) {
        /**
         * Only id today marked in timing props.
         */
        if (!this.isInWeek(now, timingProperties)) {
            return;
        }
        const momentInday = moment();
        momentInday.set('hour', timingProperties.hour);
        momentInday.set('minute', timingProperties.minutes);
        /**
         * If its new trigger timing.
         */
        if (now.isSame(momentInday, 'minute')) {
            await this.activeTiming(timing);
        }
    }
    /**
     * Handle timeout trigger timing.
     * Check if its time to trigger, and if so, trigger it.
     * @param now now.
     * @param timing timing to check.
     * @param timingProperties TimeoutTiming timing properties.
     */
    async timeoutTiming(now, timing, timingProperties) {
        const timeoutMoment = moment(timingProperties.startDate);
        timeoutMoment.add(timingProperties.durationInMimutes, 'minute');
        /**
         * If its new trigger timing.
         */
        if (now.isSame(timeoutMoment, 'minute')) {
            await this.activeTiming(timing);
        }
    }
    async timingActivation() {
        const now = moment();
        /**
         * Only if minute changed.
         */
        if (this.lastActivationMoment.isSameOrAfter(now, 'minute')) {
            return;
        }
        this.lastActivationMoment = now;
        const timings = await this.timingsDal.getTimings();
        for (const timing of timings) {
            if (!timing.isActive) {
                continue;
            }
            switch (timing.timingType) {
                case 'once': {
                    await this.onceTiming(now, timing, timing.timingProperties[timing.timingType]);
                    break;
                }
                case 'dailySunTrigger': {
                    await this.dailySunTiming(now, timing, timing.timingProperties[timing.timingType]);
                    break;
                }
                case 'dailyTimeTrigger': {
                    await this.dailyTimeTiming(now, timing, timing.timingProperties[timing.timingType]);
                    break;
                }
                case 'timeout': {
                    await this.timeoutTiming(now, timing, timing.timingProperties[timing.timingType]);
                    break;
                }
            }
        }
    }
    /**
     * Validate timing.
     * 1) operation existence.
     * 2) correct timing properties.
     * @param timing timing to validate existence.
     */
    async validateNewTimingOperation(timing) {
        await this.operationBl.getOperationById(timing.triggerOperationId);
        if (!timing.timingProperties[timing.timingType]) {
            throw {
                responseCode: 3405,
                message: 'timing properties not match to timing type',
            };
        }
        return;
    }
}
exports.TimingsBl = TimingsBl;
exports.TimingsBlSingleton = new TimingsBl(timingsDal_1.TimingsDalSingleton, operationsBl_1.OperationsBlSingleton);
//# sourceMappingURL=timingsBl.js.map