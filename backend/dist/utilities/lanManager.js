"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ip = require("ip");
const isOnline = require("is-online");
const networkList2 = require("network-list2");
const config_1 = require("../config");
const logger_1 = require("./logger");
/**
 * Get the all local network devices.
 */
exports.LocalNetworkReader = () => {
    logger_1.logger.info('Scanning network devices...');
    return new Promise(async (resolve, reject) => {
        const ops = {};
        /** Ceck if internet connection is online, otherways dont try to get vendor name. */
        const isInternetOnline = await isOnline();
        if (config_1.Configuration.scanSubnet) {
            ops.ip = config_1.Configuration.scanSubnet;
            ops.vendor = isInternetOnline;
        }
        networkList2.scan(ops, (err, netTableArray) => {
            logger_1.logger.info('Scanning network devices done.');
            if (err) {
                const msg = 'Scen local network fail';
                logger_1.logger.warn(msg);
                reject(msg);
                return;
            }
            const devices = [];
            /** Add current mechine info to table (without the MAC address!!!) */
            devices.push({
                mac: '------------',
                ip: ip.address(),
                vendor: 'casa-net server',
            });
            for (const localDevice of netTableArray) {
                if (localDevice.alive && localDevice.mac) {
                    devices.push({
                        mac: localDevice.mac.replace(/:|-|_| /g, '').toLowerCase(),
                        ip: localDevice.ip,
                        vendor: localDevice.vendor ? localDevice.vendor : undefined,
                    });
                }
            }
            resolve(devices);
        });
    });
};
//# sourceMappingURL=lanManager.js.map