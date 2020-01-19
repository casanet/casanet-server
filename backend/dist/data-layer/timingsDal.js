"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("./dataIO");
const TIMINGS_FILE_NAME = 'timings.json';
class TimingsDal {
    constructor(dataIo) {
        /**
         * timings.
         */
        this.timings = [];
        this.dataIo = dataIo;
        this.timings = dataIo.getDataSync();
    }
    /**
     * Get all timings as array.
     */
    async getTimings() {
        return this.timings;
    }
    /**
     * Get timing by id.
     * @param timingId timing id.
     */
    async getTimingById(timingId) {
        const timing = this.findTiming(timingId);
        if (!timing) {
            throw {
                responseCode: 4404,
                message: 'timing not exist',
            };
        }
        return timing;
    }
    /**
     * Save new timing.
     * @param newTiming timing to create.
     */
    async createTiming(newTiming) {
        this.timings.push(newTiming);
        await this.dataIo.setData(this.timings).catch(() => {
            this.timings.splice(this.timings.indexOf(newTiming), 1);
            throw new Error('fail to save timing');
        });
    }
    /**
     * Delete timing.
     * @param timing timing to delete.
     */
    async deleteTiming(timingId) {
        const originalTiming = this.findTiming(timingId);
        if (!originalTiming) {
            throw {
                responseCode: 4404,
                message: 'timing not exist',
            };
        }
        this.timings.splice(this.timings.indexOf(originalTiming), 1);
        await this.dataIo.setData(this.timings).catch(() => {
            this.timings.push(originalTiming);
            throw new Error('fail to save timing delete request');
        });
    }
    /**
     * Update timing.
     * @param timing timing to update.
     */
    async updateTiming(timing) {
        const originalTiming = this.findTiming(timing.timingId);
        if (!originalTiming) {
            throw {
                responseCode: 4404,
                message: 'timing not exist',
            };
        }
        this.timings.splice(this.timings.indexOf(originalTiming), 1);
        this.timings.push(timing);
        await this.dataIo.setData(this.timings).catch(() => {
            this.timings.splice(this.timings.indexOf(timing), 1);
            this.timings.push(originalTiming);
            throw new Error('fail to save timing update request');
        });
    }
    /**
     * Find timing in timings array
     */
    findTiming(timingId) {
        for (const timing of this.timings) {
            if (timing.timingId === timingId) {
                return timing;
            }
        }
    }
}
exports.TimingsDal = TimingsDal;
exports.TimingsDalSingleton = new TimingsDal(new dataIO_1.DataIO(TIMINGS_FILE_NAME));
//# sourceMappingURL=timingsDal.js.map