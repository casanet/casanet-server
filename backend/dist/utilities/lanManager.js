"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const networkList2 = require("network-list2");
const logger_1 = require("./logger");
/**
 * Get the all local network devices.
 */
exports.LocalNetworkReader = () => {
    logger_1.logger.info('Scanning network devices...');
    return new Promise((resolve, reject) => {
        networkList2.scan({}, (err, netTableArray) => {
            logger_1.logger.info('Scanning network devices done.');
            if (err) {
                const msg = 'Scen local network fail';
                logger_1.logger.warn(msg);
                reject(msg);
                return;
            }
            const devices = [];
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