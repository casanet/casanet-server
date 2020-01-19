"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dgram = require("dgram");
const moment = require("moment");
const Orvibo = require("node-orvibo-2");
const logger_1 = require("../../utilities/logger");
const sleep_1 = require("../../utilities/sleep");
const brandModuleBase_1 = require("../brandModuleBase");
class OrviboHandler extends brandModuleBase_1.BrandModuleBase {
    constructor() {
        super();
        this.brandName = 'orvibo';
        this.devices = [
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: false,
                minionsPerDevice: 1,
                model: 'S20',
                suppotedMinionType: 'switch',
                isRecordingSupported: false,
            },
        ];
        this.initOrviboCommunication();
    }
    async getStatus(minion) {
        return new Promise((resolve, reject) => {
            /** create timeout, case device not responsing */
            const timeoutTimer = setTimeout(() => {
                this.queryCallback = undefined;
                logger_1.logger.warn(`Fail to get orvibo device ${minion.minionId} state, timeout`);
                reject({
                    responseCode: 1503,
                    message: 'receive UDP answer from device fail',
                });
            }, moment.duration(5, 'seconds').asMilliseconds());
            /** Set callback to subscribe event */
            this.subscribeCallback = deviceResult => {
                if (deviceResult.macAddress !== minion.device.pysicalDevice.mac) {
                    return;
                }
                this.queryCallback = undefined;
                clearTimeout(timeoutTimer);
                resolve({
                    switch: {
                        status: deviceResult.state ? 'on' : 'off',
                    },
                });
            };
            /** Then resubscribe to get the current status */
            this.reSubsribeOrvibo(minion).catch(error => {
                reject({
                    responseCode: 7503,
                    message: 'Getting status fail',
                });
            });
        });
    }
    async setStatus(minion, setStatus) {
        await this.reSubsribeOrvibo(minion);
        return new Promise((resolve, reject) => {
            /** Create set status message */
            const message = this.orviboCommunication.prepareMessage({
                commandID: '6463',
                macAddress: minion.device.pysicalDevice.mac,
                macPadding: '202020202020',
                data: {
                    // Session ID?
                    blank: '00000000',
                    // Ternary operators are cool, but hard to read.
                    // This one says "if state is true, set state to 01, otherwise, set to 00"
                    state: setStatus.switch.status === 'on' ? '01' : '00',
                },
            });
            /** Send status message to device */
            this.orviboCommunication.sendMessage(message, minion.device.pysicalDevice.ip);
            /** create timeout, case device not responsing */
            const timeoutTimer = setTimeout(() => {
                this.queryCallback = undefined;
                logger_1.logger.warn(`Fail to set orvibo device ${minion.minionId} ${setStatus.switch.status} state, timeout`);
                reject({
                    responseCode: 1503,
                    message: 'receive UDP answer from device fail',
                });
            }, moment.duration(5, 'seconds').asMilliseconds());
            /** set callback to query event */
            this.queryCallback = deviceResult => {
                if (deviceResult.macAddress !== minion.device.pysicalDevice.mac) {
                    return;
                }
                this.queryCallback = undefined;
                clearTimeout(timeoutTimer);
                if (setStatus.switch.status === (deviceResult.state ? 'on' : 'off')) {
                    resolve();
                    return;
                }
                reject({
                    responseCode: 6503,
                    message: 'Setting status fail',
                });
            };
        });
    }
    async enterRecordMode(miniom, statusToRecordFor) {
        throw {
            responseCode: 5010,
            message: 'the orvibo module not support any recording mode',
        };
    }
    async generateCommand(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the orvibo module not support any recording mode',
        };
    }
    async setFetchedCommands(minion, commandsSet) {
        // There's nothing to do.
    }
    async refreshCommunication() {
        // There's nothing to do.
    }
    /**
     * Check if UDP port binded to other application.
     * @param port port to check.
     */
    checkPortAvailability(port) {
        return new Promise((resolve, reject) => {
            const socket = dgram.createSocket('udp4');
            socket.on('error', e => {
                reject(e);
            });
            socket.bind(port, () => {
                socket.close();
                resolve();
            });
        });
    }
    /** Init connection (UDP socket) for orvibo,
     * and listen to broadcasts messags in LAN
     */
    async initOrviboCommunication() {
        try {
            await this.checkPortAvailability(10000);
            await this.checkPortAvailability(9999);
            await this.checkPortAvailability(48899);
        }
        catch (error) {
            this.orviboCommunication = undefined;
            logger_1.logger.error('Fail to init orvibo communication');
            return;
        }
        /** Create the orvibo protocol instance */
        this.orviboCommunication = new Orvibo();
        /** open the needs UDP channel */
        this.orviboCommunication.listen();
        /** listen to any device status changes arrived */
        this.orviboCommunication.on('externalstatechanged', async (changedDevice) => {
            if (!changedDevice) {
                return;
            }
            if (this.queryCallback) {
                this.queryCallback(changedDevice);
            }
            if (!this.retrieveMinions.isPullingAvailble) {
                return;
            }
            const minions = await this.retrieveMinions.pull();
            for (const minion of minions) {
                if (minion.device.pysicalDevice.mac === changedDevice.macAddress) {
                    this.minionStatusChangedEvent.next({
                        minionId: minion.minionId,
                        status: {
                            switch: {
                                status: changedDevice.state ? 'on' : 'off',
                            },
                        },
                    });
                }
            }
        });
        /** Registar to query data response arrived */
        this.orviboCommunication.on('queried', async (queriedDevice) => {
            if (this.queryCallback) {
                this.queryCallback(queriedDevice);
            }
        });
        /** Registar to subscribed data response arrived */
        this.orviboCommunication.on('subscribed', async (subscribedDevice) => {
            if (this.subscribeCallback) {
                this.subscribeCallback(subscribedDevice);
            }
        });
    }
    /**
     * Re-subscribe to current orivbo device, use to know the status
     * (orvibo send it by subscribe and button pressed only) and also to alow set status.
     * @param miniom The minion of device.
     */
    async reSubsribeOrvibo(miniom) {
        /** If there is no connection, try to init it */
        if (!this.orviboCommunication) {
            try {
                this.initOrviboCommunication();
            }
            catch (error) {
                this.orviboCommunication = undefined;
                throw {
                    responseCode: 1503,
                    message: 'there is no UDP socket to send request by',
                };
            }
        }
        /** Reload device each time befor sending data using UDP */
        const currentOrviboDevice = this.orviboCommunication.getDevice(miniom.device.pysicalDevice.mac);
        if (currentOrviboDevice) {
            this.orviboCommunication.devices.splice(this.orviboCommunication.devices.indexOf(currentOrviboDevice), 1);
        }
        /** Create device object */
        const orvibo = {
            macAddress: miniom.device.pysicalDevice.mac,
            macPadding: '202020202020',
            type: 'Socket',
            ip: miniom.device.pysicalDevice.ip,
            // Takes the last character from the message and turns it into a boolean.
            // This is our socket's initial state
            state: false,
        };
        /** Add it to lib collection */
        this.orviboCommunication.addDevice(orvibo);
        /** Tell lib to subscribe device events results */
        this.orviboCommunication.subscribe(orvibo);
        /** Let UDP to be sent */
        await sleep_1.Delay(moment.duration(0.5, 'seconds'));
    }
}
exports.OrviboHandler = OrviboHandler;
//# sourceMappingURL=orviboHandler.js.map