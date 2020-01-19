"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const Tuyapi = require("tuyapi");
const logger_1 = require("../../utilities/logger");
const sleep_1 = require("../../utilities/sleep");
const brandModuleBase_1 = require("../brandModuleBase");
class TuyaHandler extends brandModuleBase_1.BrandModuleBase {
    constructor() {
        super();
        this.brandName = 'tuya';
        this.devices = [
            {
                brand: this.brandName,
                isTokenRequierd: true,
                isIdRequierd: true,
                minionsPerDevice: 3,
                model: 'wall switch, 3 gangs, first one',
                suppotedMinionType: 'switch',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: true,
                isIdRequierd: true,
                minionsPerDevice: 3,
                model: 'wall switch, 3 gangs, second one',
                suppotedMinionType: 'switch',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: true,
                isIdRequierd: true,
                minionsPerDevice: 3,
                model: 'wall switch, 3 gangs, third one',
                suppotedMinionType: 'switch',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: true,
                isIdRequierd: true,
                minionsPerDevice: 1,
                model: 'curtain',
                suppotedMinionType: 'roller',
                isRecordingSupported: false,
            },
        ];
        /**
         * Map devices by mac address
         */
        this.pysicalDevicesMap = {};
        /** Cache last status, to ignore unnececary updates.  */
        this.devicesStatusCache = {};
    }
    async getStatus(miniom) {
        /**
         * Get tuya device instance
         */
        const tuyaDevice = await this.getTuyaDevice(miniom.device);
        if (miniom.device.model.indexOf('curtain') !== -1) {
            try {
                const rowStatus = await tuyaDevice.get();
                return {
                    roller: {
                        status: rowStatus !== '3' ? 'on' : 'off',
                        direction: rowStatus === '1' ? 'up' : 'down',
                    },
                };
            }
            catch (err) {
                logger_1.logger.warn(`Fail to get status of ${miniom.minionId}, ${err}`);
                if (typeof err === 'object' && err.message === 'fffffffffffffff') {
                    throw {
                        responseCode: 9503,
                        message: 'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
                    };
                }
                throw {
                    responseCode: 1503,
                    message: 'communication with tuya device fail',
                };
            }
        }
        const stausResult = await tuyaDevice.get({ schema: true }).catch((err) => {
            logger_1.logger.warn(`Fail to get status of ${miniom.minionId}, ${err}`);
            if (typeof err === 'object' &&
                err.message ===
                    'Error communicating with device. Make sure nothing else is trying to control it or connected to it.') {
                throw {
                    responseCode: 9503,
                    message: 'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
                };
            }
            throw {
                responseCode: 1503,
                message: 'communication with tuya device fail',
            };
        });
        /** Case stausResult get a garbage value */
        if (typeof stausResult !== 'object' || !stausResult.dps) {
            throw {
                responseCode: 10503,
                message: 'tuya device gives garbage values.',
            };
        }
        /**
         * Extract the current minion status.
         */
        let currentGangStatus;
        switch (miniom.device.model) {
            case 'wall switch, 3 gangs, first one':
                currentGangStatus = stausResult.dps[1];
                break;
            case 'wall switch, 3 gangs, second one':
                currentGangStatus = stausResult.dps[2];
                break;
            case 'wall switch, 3 gangs, third one':
                currentGangStatus = stausResult.dps[3];
                break;
        }
        return {
            switch: {
                status: currentGangStatus ? 'on' : 'off',
            },
        };
    }
    async setStatus(miniom, setStatus) {
        /**
         * Get tuya device instance
         */
        const tuyaDevice = await this.getTuyaDevice(miniom.device);
        if (miniom.device.model.indexOf('curtain') !== -1) {
            try {
                await tuyaDevice.set({
                    set: setStatus.roller.status === 'off' ? '3' : setStatus.roller.direction === 'up' ? '1' : '2',
                });
                return;
            }
            catch (err) {
                logger_1.logger.warn(`Fail to get status of ${miniom.minionId}, ${err}`);
                if (typeof err === 'object' &&
                    err.message ===
                        'Error communicating with device. Make sure nothing else is trying to control it or connected to it.') {
                    throw {
                        responseCode: 9503,
                        message: 'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
                    };
                }
                throw {
                    responseCode: 1503,
                    message: 'communication with tuya device fail',
                };
            }
        }
        /**
         * Get current minion gang index.
         */
        let gangIndex;
        switch (miniom.device.model) {
            case 'wall switch, 3 gangs, first one':
                gangIndex = 1;
                break;
            case 'wall switch, 3 gangs, second one':
                gangIndex = 2;
                break;
            case 'wall switch, 3 gangs, third one':
                gangIndex = 3;
                break;
        }
        await tuyaDevice.set({ set: setStatus.switch.status === 'on', dps: gangIndex }).catch(err => {
            logger_1.logger.warn(`Fail to get status of ${miniom.minionId}, ${err}`);
            if (typeof err === 'object' &&
                err.message ===
                    'Error communicating with device. Make sure nothing else is trying to control it or connected to it.') {
                throw {
                    responseCode: 9503,
                    message: 'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
                };
            }
            throw {
                responseCode: 1503,
                message: 'communication with tuya device fail',
            };
        });
    }
    async enterRecordMode(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the tuya module not support any recording mode',
        };
    }
    async generateCommand(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the tuya module not support any recording mode',
        };
    }
    async setFetchedCommands(minion, commandsSet) {
        // There's nothing to do.
    }
    async refreshCommunication() {
        for (const tuyaApi of Object.values(this.pysicalDevicesMap)) {
            tuyaApi.disconnect();
        }
        this.pysicalDevicesMap = {};
    }
    /**
     * Create new tuya communication device api.
     * and also listen to data arrived from device.
     * @param minionDevice minion device property to create for.
     */
    async createTuyaDevice(minionDevice) {
        /**
         * Create tuya device.
         */
        const tuyaDevice = new Tuyapi({
            id: minionDevice.deviceId,
            key: minionDevice.token,
            persistentConnection: true,
        });
        await tuyaDevice.find();
        /**
         * Subscribe to status changed event.
         */
        tuyaDevice.on('data', async (data) => {
            /** Case data arrived with garbage value */
            if (typeof data === 'string') {
                return;
            }
            /** If data same as cached, abort. */
            if (this.devicesStatusCache[minionDevice.pysicalDevice.mac] === JSON.stringify(data)) {
                return;
            }
            /** Save data as last status cache. */
            this.devicesStatusCache[minionDevice.pysicalDevice.mac] = JSON.stringify(data);
            logger_1.logger.debug(`tuya device mac: ${minionDevice.pysicalDevice.mac} data arrived`);
            if (minionDevice.model.indexOf('curtain') !== -1) {
                try {
                    const rowStatus = await tuyaDevice.get();
                    const minions = await this.retrieveMinions.pull();
                    for (const minion of minions) {
                        /**
                         * Find the minions that used current pysical tuya device
                         */
                        if (minion.device.deviceId !== minionDevice.deviceId) {
                            continue;
                        }
                        const status = rowStatus !== '3' ? 'on' : 'off';
                        const direction = rowStatus === '1' ? 'up' : 'down';
                        this.minionStatusChangedEvent.next({
                            minionId: minion.minionId,
                            status: {
                                roller: {
                                    status,
                                    direction,
                                },
                            },
                        });
                    }
                }
                catch (error) { }
                return;
            }
            /**
             * Get the current status (the 'data' paramerer is invalid)
             */
            tuyaDevice.get({ schema: true }).then(status => {
                /** Case status get a garbage value */
                if (typeof status !== 'object' || !status.dps) {
                    return;
                }
                /**
                 * Pull the current minions array in system.
                 */
                this.retrieveMinions.pull().then(minions => {
                    for (const minion of minions) {
                        /**
                         * Find the minions that used current pysical tuya device
                         */
                        if (minion.device.deviceId !== minionDevice.deviceId) {
                            continue;
                        }
                        /**
                         * Then read the current status for specific model and
                         * send new status update to all subsribers.
                         */
                        if (minion.device.model === 'wall switch, 3 gangs, first one') {
                            this.minionStatusChangedEvent.next({
                                minionId: minion.minionId,
                                status: {
                                    switch: {
                                        status: status.dps['1'] ? 'on' : 'off',
                                    },
                                },
                            });
                        }
                        if (minion.device.model === 'wall switch, 3 gangs, second one') {
                            this.minionStatusChangedEvent.next({
                                minionId: minion.minionId,
                                status: {
                                    switch: {
                                        status: status.dps['2'] ? 'on' : 'off',
                                    },
                                },
                            });
                        }
                        if (minion.device.model === 'wall switch, 3 gangs, third one') {
                            this.minionStatusChangedEvent.next({
                                minionId: minion.minionId,
                                status: {
                                    switch: {
                                        status: status.dps['3'] ? 'on' : 'off',
                                    },
                                },
                            });
                        }
                    }
                });
            });
        });
        /**
         * Subscribe to error event.
         */
        tuyaDevice.on('error', async (err) => {
            logger_1.logger.debug(`tuya device mac: ${minionDevice.pysicalDevice.mac} error: ${err}`);
            try {
                tuyaDevice.disconnect();
                delete this.pysicalDevicesMap[minionDevice.pysicalDevice.mac];
                sleep_1.Delay(moment.duration(5, 'seconds'));
                await this.getTuyaDevice(minionDevice);
            }
            catch (error) {
                logger_1.logger.warn(`reconnecting TCP connection to the tuya mac: ${minionDevice.pysicalDevice.mac} fail error: ${error}`);
            }
        });
        /**
         * Establish connection
         */
        await tuyaDevice.connect();
        /**
         * Save the device API in map. to allow instance useing.
         */
        this.pysicalDevicesMap[minionDevice.pysicalDevice.mac] = tuyaDevice;
    }
    /**
     * Get tuya device API instance.
     * @param minionDevice The minion device property. to get tuya instance for.
     * @returns tuya device API instance
     */
    async getTuyaDevice(minionDevice) {
        if (!(minionDevice.pysicalDevice.mac in this.pysicalDevicesMap)) {
            await this.createTuyaDevice(minionDevice);
        }
        return this.pysicalDevicesMap[minionDevice.pysicalDevice.mac];
    }
}
exports.TuyaHandler = TuyaHandler;
//# sourceMappingURL=tuyaHandler.js.map