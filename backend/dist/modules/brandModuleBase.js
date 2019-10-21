"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fse = require("fs-extra");
const path = require("path");
const pull_behavior_1 = require("pull-behavior");
const rxjs_1 = require("rxjs");
const config_1 = require("../config");
const logger_1 = require("../utilities/logger");
/**
 * Any smart devices brand communication module needs to inherit..
 */
class BrandModuleBase {
    constructor() {
        /**
         * Let minions manager to know if any minion status changed by pysical interface of device.
         */
        this.minionStatusChangedEvent = new rxjs_1.BehaviorSubject(undefined);
        /**
         * This PullBehavior Allows to retrieve minions array.
         * Used when new status arrived and need all minions array to know for witch minion update belong.
         * some of is by mac some by other data.
         */
        this.retrieveMinions = new pull_behavior_1.PullBehavior();
    }
    /**
     * Cache file pull path.
     */
    get cacheFilePath() {
        return `${path.join(BrandModuleBase.CACHE_DIRACTORY, this.brandName)}.json`;
    }
    /**
     * Get cache JSON data sync.
     * Use it in init only. else the app will black until read finish.
     */
    getCacheDataSync() {
        try {
            return fse.readJSONSync(this.cacheFilePath);
        }
        catch (error) {
            return undefined;
        }
    }
    /**
     * Get cache JSON data.
     */
    async getCacheData() {
        const data = await fse.readJSON(this.cacheFilePath)
            .catch((err) => {
            logger_1.logger.warn(`Fail to read ${this.cacheFilePath} cache file, ${err}`);
            throw new Error('Fail to read cache data');
        });
        return data;
    }
    /**
     * Save JSON to module cache.
     * @param data Data to save in cache.
     */
    async setCacheData(data) {
        await fse.outputFile(this.cacheFilePath, JSON.stringify(data, null, 2))
            .catch((err) => {
            logger_1.logger.warn(`Fail to write ${this.cacheFilePath} cache file, ${err}`);
            throw new Error('Fail to write cache data');
        });
    }
}
exports.BrandModuleBase = BrandModuleBase;
BrandModuleBase.CACHE_DIRACTORY = path.join('./data/', config_1.Configuration.runningMode, '/cache/');
//# sourceMappingURL=brandModuleBase.js.map