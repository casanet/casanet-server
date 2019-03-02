"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const brandModuleBase_1 = require("../brandModuleBase");
// tslint:disable-next-line:no-var-requires
const Broadlink = require('./broadlinkProtocol');
class BroadlinkHandler extends brandModuleBase_1.BrandModuleBase {
    constructor() {
        super();
        this.cache = [];
        this.brandName = 'broadlink';
        this.devices = [
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: false,
                minionsPerDevice: 1,
                model: 'SP2',
                suppotedMinionType: 'switch',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: false,
                minionsPerDevice: -1,
                model: 'RM3 / RM Pro as IR AC',
                suppotedMinionType: 'airConditioning',
                isRecordingSupported: true,
            },
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: false,
                minionsPerDevice: -1,
                model: 'RM Pro as RF toggle',
                suppotedMinionType: 'toggle',
                isRecordingSupported: true,
            },
        ];
        const cache = super.getCacheDataSync();
        if (cache) {
            this.cache = cache;
        }
    }
    updateCache() {
        this.setCacheData(this.cache)
            .then(() => { })
            .catch(() => { });
    }
    getOrCreateMinionCache(miniom) {
        for (const minionCache of this.cache) {
            if (minionCache.minionId === miniom.minionId) {
                return minionCache;
            }
        }
        /** Case there is not cache struct for minion, create it */
        const newMinionCache = {
            minionId: miniom.minionId,
            lastStatus: undefined,
        };
        this.cache.push(newMinionCache);
        this.updateCache();
        return newMinionCache;
    }
    /**
     * Get IR command (HEX string) for given status. for AC only.
     * @param airConditioningCommands array of all commands to find command in.
     * @param airConditioningStatus The AC status to get command for.
     * @returns IR code struct or undefined if not exist.
     */
    getMinionACStatusCommand(airConditioningCommands, airConditioningStatus) {
        for (const airConditioningCommand of airConditioningCommands) {
            if (airConditioningCommand.status.fanStrength === airConditioningStatus.fanStrength &&
                airConditioningCommand.status.mode === airConditioningStatus.mode &&
                airConditioningCommand.status.temperature === airConditioningStatus.temperature) {
                return airConditioningCommand;
            }
        }
    }
    async getSP2Status(miniom) {
        return new Promise((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 }, miniom.device.pysicalDevice.mac, (err) => {
                if (err) {
                    reject({
                        responseCode: 1503,
                        message: 'Connection to device fail',
                    });
                    return;
                }
                broadlinkDevice.checkPower((err2, state) => {
                    if (err2) {
                        reject({
                            responseCode: 7503,
                            message: 'Getting status fail',
                        });
                        return;
                    }
                    resolve({
                        switch: {
                            status: state ? 'on' : 'off',
                        },
                    });
                });
            });
        });
    }
    async setSP2Status(miniom, setStatus) {
        return new Promise((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 }, miniom.device.pysicalDevice.mac, (err) => {
                if (err) {
                    reject({
                        responseCode: 1503,
                        message: 'Connection to device fail',
                    });
                    return;
                }
                broadlinkDevice.setPower(setStatus.switch.status === 'on' ? true : false, (err2) => {
                    if (err2) {
                        reject({
                            responseCode: 6503,
                            message: 'Setting status fail',
                        });
                        return;
                    }
                    resolve();
                });
            });
        });
    }
    /**
     * Get last status, use in all devices that not holing any data, such as IR transmitter.
     * @param miniom minion to get last status for.
     */
    async getCachedStatus(miniom) {
        return new Promise((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 }, miniom.device.pysicalDevice.mac, (err) => {
                if (err) {
                    reject({
                        responseCode: 1503,
                        message: 'Connection to device fail',
                    });
                    return;
                }
                const minionCache = this.getOrCreateMinionCache(miniom);
                if (!minionCache.lastStatus) {
                    reject({
                        responseCode: 5503,
                        message: 'Current status is unknown, no history for current one-way transmitter',
                    });
                    return;
                }
                resolve(minionCache.lastStatus);
            });
        });
    }
    async setRFToggleStatus(miniom, setStatus) {
        return new Promise((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 }, miniom.device.pysicalDevice.mac, (err) => {
                if (err) {
                    reject({
                        responseCode: 1503,
                        message: 'Connection to device fail',
                    });
                    return;
                }
                const minionCache = this.getOrCreateMinionCache(miniom);
                if (!minionCache.toggleCommands) {
                    reject({
                        responseCode: 4503,
                        message: 'there is no availble command. record a on off commands set.',
                    });
                    return;
                }
                const hexCommandCode = setStatus.toggle.status === 'on'
                    ? minionCache.toggleCommands.on
                    : minionCache.toggleCommands.off;
                broadlinkDevice.sendData(hexCommandCode, (err2) => {
                    if (err2) {
                        reject(err2);
                        return;
                    }
                    minionCache.lastStatus = setStatus;
                    this.updateCache();
                    resolve();
                });
            });
        });
    }
    async setIRACSwitchStatus(miniom, setStatus) {
        return new Promise((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 }, miniom.device.pysicalDevice.mac, (err) => {
                if (err) {
                    reject({
                        responseCode: 1503,
                        message: 'Connection to device fail',
                    });
                    return;
                }
                const minionCache = this.getOrCreateMinionCache(miniom);
                if (!minionCache.acCommands) {
                    reject({
                        responseCode: 3503,
                        message: 'there is no any command',
                    });
                    return;
                }
                let hexCommandCode;
                /**
                 * If the request is to set off, get the off command.
                 */
                if (setStatus.airConditioning.status === 'off') {
                    hexCommandCode = minionCache.acCommands.off;
                }
                else {
                    /**
                     * Else try to get the correct command for given status to set.
                     */
                    const acCommand = this.getMinionACStatusCommand(minionCache.acCommands.statusCommands, setStatus.airConditioning);
                    /** If there is command, get it. */
                    hexCommandCode = acCommand ? acCommand.command : '';
                }
                if (!hexCommandCode) {
                    reject({
                        responseCode: 4503,
                        message: 'there is no availble command for current status. record a new command.',
                    });
                    return;
                }
                broadlinkDevice.sendData(hexCommandCode, (err2) => {
                    if (err2) {
                        reject(err2);
                        return;
                    }
                    minionCache.lastStatus = setStatus;
                    this.updateCache();
                    resolve();
                });
            });
        });
    }
    async recordIRACCommands(miniom, statusToRecordFor) {
        return new Promise((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 }, miniom.device.pysicalDevice.mac, (err) => {
                if (err) {
                    reject({
                        responseCode: 1503,
                        message: 'Connection to device fail',
                    });
                    return;
                }
                const minionCache = this.getOrCreateMinionCache(miniom);
                if (!minionCache.acCommands) {
                    minionCache.acCommands = {
                        off: '',
                        statusCommands: [],
                    };
                }
                broadlinkDevice.enterLearning(moment.duration(5, 'seconds').asMilliseconds(), (err2, hexIRCommand) => {
                    if (err2) {
                        reject({
                            responseCode: 2503,
                            message: 'Recording fail or timeout',
                        });
                        return;
                    }
                    /** If status is off, jusr save it. */
                    if (statusToRecordFor.airConditioning.status === 'off') {
                        minionCache.acCommands.off = hexIRCommand;
                    }
                    else {
                        /** Else, get record objec if exsit and update command */
                        let statusCommand = this.getMinionACStatusCommand(minionCache.acCommands.statusCommands, statusToRecordFor.airConditioning);
                        /** If command object not exist yet, create new one and add it to commands array */
                        if (!statusCommand) {
                            statusCommand = {
                                command: '',
                                status: statusToRecordFor.airConditioning,
                            };
                            minionCache.acCommands.statusCommands.push(statusCommand);
                        }
                        statusCommand.command = hexIRCommand;
                    }
                    this.updateCache();
                    resolve();
                });
            });
        });
    }
    async recordRFToggleCommands(miniom, statusToRecordFor) {
        // TODO: swap and then record.
        throw {
            responseCode: 5501,
            message: 'Not implemented yet.',
        };
    }
    async getStatus(miniom) {
        switch (miniom.device.model) {
            case 'SP2':
                return await this.getSP2Status(miniom);
            case 'RM Pro as RF toggle':
                return await this.getCachedStatus(miniom);
            case 'RM3 / RM Pro as IR AC':
                return await this.getCachedStatus(miniom);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        };
    }
    async setStatus(miniom, setStatus) {
        switch (miniom.device.model) {
            case 'SP2':
                return await this.setSP2Status(miniom, setStatus);
            case 'RM Pro as RF toggle':
                return await this.setRFToggleStatus(miniom, setStatus);
            case 'RM3 / RM Pro as IR AC':
                return await this.setIRACSwitchStatus(miniom, setStatus);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        };
    }
    async enterRecordMode(miniom, statusToRecordFor) {
        switch (miniom.device.model) {
            case 'RM Pro as RF toggle':
                return await this.recordRFToggleCommands(miniom, statusToRecordFor);
            case 'RM3 / RM Pro as IR AC':
                return await this.recordIRACCommands(miniom, statusToRecordFor);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        };
    }
}
exports.BroadlinkHandler = BroadlinkHandler;
//# sourceMappingURL=broadlinkHandler.js.map