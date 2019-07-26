"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise");
const config_1 = require("../config");
const modulesManager_1 = require("../modules/modulesManager");
const logger_1 = require("../utilities/logger");
const minionsBl_1 = require("./minionsBl");
class RfBl {
    /**
     * Init minions bl. using dependecy injection pattern to allow units testings.
     * @param minionsDal Inject the dal instance.
     */
    constructor(minionsBl, modulesManager) {
        this.minionsBl = minionsBl;
        this.modulesManager = modulesManager;
    }
    /**
     * Get all aupported devices in commands repo.
     * @returns supported devices collection.
     */
    async getAvailableDevicesToFetch() {
        try {
            return await request({
                method: 'GET',
                uri: `${config_1.Configuration.commandsRepoUrl}/devices`,
                json: true,
            });
        }
        catch (error) {
            logger_1.logger.warn(`Get supported devices from commands repo fail, ${JSON.stringify(!error ? error : error.message)}`);
            throw {
                responseCode: 10501,
                message: 'Get supported devices from commands repo fail',
            };
        }
    }
    /**
     * Fetch commands set for certain minion.
     * @param minionId minion to fetch commands for.
     * @param commandsRepoDevice devices commands set to fetch.
     */
    async fetchDeviceCommandsToMinion(minionId, commandsRepoDevice) {
        const minion = await this.minionsBl.getMinionById(minionId);
        try {
            const commands = await request({
                method: 'GET',
                uri: `${config_1.Configuration.commandsRepoUrl}/rf/${commandsRepoDevice.brand}/${commandsRepoDevice.model}`,
                json: true,
            });
            const commandsSet = {
                deviceType: minion.minionType,
                commands: {},
            };
            commandsSet.commands[minion.minionType] = commands;
            await this.modulesManager.setFetchedCommands(minion, commandsSet);
        }
        catch (error) {
            // tslint:disable-next-line:max-line-length
            logger_1.logger.warn(`Fetch rf commands for ${commandsRepoDevice.brand}/${commandsRepoDevice.model} fail, ${JSON.stringify(!error ? error : error.message)}`);
            throw {
                responseCode: 11501,
                message: 'Fetch rf commands commands repo fail',
            };
        }
    }
    /**
     * Record command for current minion status.
     * @param minionId minion to record for.
     * @param statusToRecordFor The status to record command for.
     */
    async recordCommand(minionId, statusToRecordFor) {
        const minion = await this.minionsBl.getMinionById(minionId);
        /**
         * The minion status is depend on minion type.
         */
        if (!statusToRecordFor[minion.minionType]) {
            throw {
                responseCode: 1405,
                message: 'incorrect minion status for current minion type',
            };
        }
        await this.modulesManager.enterRecordMode(minion, statusToRecordFor);
    }
    /**
     * Record command for current minion status.
     * @param minionId minion to record for.
     * @param statusToGenerateFor The status to record command for.
     */
    async generateCommand(minionId, statusToGenerateFor) {
        const minion = await this.minionsBl.getMinionById(minionId);
        /**
         * The minion status is depend on minion type.
         */
        if (!statusToGenerateFor[minion.minionType]) {
            throw {
                responseCode: 1405,
                message: 'incorrect minion status for current minion type',
            };
        }
        await this.modulesManager.generateCommand(minion, statusToGenerateFor);
    }
}
exports.RfBl = RfBl;
exports.RfBlSingleton = new RfBl(minionsBl_1.MinionsBlSingleton, modulesManager_1.ModulesManagerSingltone);
//# sourceMappingURL=rfBl.js.map