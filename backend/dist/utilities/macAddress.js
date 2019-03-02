"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getMac = require("getmac");
const logger_1 = require("../utilities/logger");
/** Hold machine mac address, using lazy loading style. */
let machineMacAddress;
/**
 * Get machine mac address. in 0b1a2c3d2345 fromat.
 * @returns the mac address.
 */
exports.GetMachinMacAddress = () => {
    return new Promise((resolve, reject) => {
        /** If mac address already known, send it */
        if (machineMacAddress) {
            resolve(machineMacAddress);
            return;
        }
        /** Read the machine mac address */
        getMac.getMac((err, rawMacAddress) => {
            if (err) {
                logger_1.logger.error('Cant read local MAC address');
                reject(err);
                return;
            }
            /** Format mac address to correct format. */
            machineMacAddress = rawMacAddress.replace(/:|-|_| /g, '').toLowerCase();
            resolve(machineMacAddress);
        });
    });
};
//# sourceMappingURL=macAddress.js.map