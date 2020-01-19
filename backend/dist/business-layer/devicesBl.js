"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const devicesDal_1 = require("../data-layer/devicesDal");
const modulesManager_1 = require("../modules/modulesManager");
const lanManager_1 = require("../utilities/lanManager");
const logger_1 = require("../utilities/logger");
class DevicesBl {
    /**
     * Init DevicesBl . using dependecy injection pattern to allow units testings.
     * @param devicesDal Inject devices dal.
     * @param localNetworkReader Inject the reader function.
     */
    constructor(devicesDal, localNetworkReader, modulesManager) {
        /**
         * Local devices changes feed.
         */
        this.devicesUpdate = new rxjs_1.BehaviorSubject([]);
        /**
         * local devices.
         */
        this.localDevices = [];
        this.devicesDal = devicesDal;
        this.localNetworkReader = localNetworkReader;
        this.modulesManager = modulesManager;
    }
    /**
     * Get all local network devices
     */
    async getDevices() {
        return this.localDevices;
    }
    /**
     * Set name to device.
     * @param deviceToSet Device to cached.
     */
    async setDeviceName(deviceToSet) {
        await this.devicesDal.saveDevice(deviceToSet);
        await this.loadDevicesName();
        this.devicesUpdate.next(this.localDevices);
    }
    /**
     * Rescan local network.
     */
    async rescanNetwork() {
        await this.loadDevices();
        this.devicesUpdate.next(this.localDevices);
    }
    /**
     * Get devices models kinds array.
     */
    async getDevicesKins() {
        return this.modulesManager.devicesKind;
    }
    /**
     * Load local devices name from saved cache.
     */
    async loadDevicesName() {
        const cachedDevices = await this.devicesDal.getDevices();
        for (const localDevice of this.localDevices) {
            for (const cachedDevice of cachedDevices) {
                if (cachedDevice.mac === localDevice.mac) {
                    localDevice.name = cachedDevice.name;
                    break;
                }
            }
        }
    }
    /**
     * Load local network devices data.
     */
    async loadDevices() {
        this.localDevices = (await this.localNetworkReader().catch(() => {
            logger_1.logger.warn('Loading devices network fail, setting devices as empty array...');
            this.localDevices = [];
        }));
        await this.loadDevicesName().catch(() => {
            logger_1.logger.warn('Loading devices names fail');
        });
    }
}
exports.DevicesBl = DevicesBl;
exports.DevicesBlSingleton = new DevicesBl(devicesDal_1.DevicesDalSingleton, lanManager_1.LocalNetworkReader, modulesManager_1.ModulesManagerSingltone);
//# sourceMappingURL=devicesBl.js.map