"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("./dataIO");
const DEVICES_FILE_NAME = 'devices.json';
/**
 * Used only to save devices name map to mac address. not any other use.
 */
class DevicesDal {
    constructor(dataIo) {
        /**
         * Kept Devices.
         */
        this.devices = [];
        this.dataIo = dataIo;
        this.devices = dataIo.getDataSync();
    }
    /**
     * Get all saved devices as array.
     */
    async getDevices() {
        return this.devices;
    }
    /**
     * Save new device mac name map.
     */
    async saveDevice(deviceToSave) {
        const originalDevice = this.findDevice(deviceToSave.mac);
        if (originalDevice) {
            this.devices.splice(this.devices.indexOf(originalDevice), 1);
        }
        this.devices.push(deviceToSave);
        await this.dataIo.setData(this.devices).catch(() => {
            this.devices.splice(this.devices.indexOf(deviceToSave), 1);
            if (originalDevice) {
                this.devices.push(originalDevice);
            }
            throw new Error('fail to save device');
        });
    }
    /**
     * Remove device name map.
     */
    async removeDevice(deviceToRemove) {
        const originalDevice = this.findDevice(deviceToRemove.mac);
        if (!originalDevice) {
            throw new Error('device not saved');
        }
        this.devices.splice(this.devices.indexOf(originalDevice), 1);
        await this.dataIo.setData(this.devices).catch(() => {
            this.devices.push(originalDevice);
            throw new Error('fail to save device removed request');
        });
    }
    /**
     * Find device in devices array
     */
    findDevice(mac) {
        for (const device of this.devices) {
            if (device.mac === mac) {
                return device;
            }
        }
    }
}
exports.DevicesDal = DevicesDal;
exports.DevicesDalSingleton = new DevicesDal(new dataIO_1.DataIO(DEVICES_FILE_NAME));
//# sourceMappingURL=devicesDal.js.map