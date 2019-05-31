import * as getMac from 'getmac';
import { logger } from '../utilities/logger';

/** Hold machine mac address, using lazy loading style. */
let machineMacAddress: string;

/**
 * Get machine mac address. in 0b1a2c3d2345 fromat.
 * @returns the mac address.
 */
export const GetMachinMacAddress = (): Promise<string> => {
    return new Promise<string>((resolve, reject) => {

        /** If mac address already known, send it */
        if (machineMacAddress) {
            resolve(machineMacAddress);
            return;
        }

        /** If MAC address passed by env var, just use it */
        if (process.env.PHYSICAL_ADDRESS) {
            machineMacAddress = process.env.PHYSICAL_ADDRESS;
            logger.info(`Using '${machineMacAddress}' physical address, loadded from env var.`);
            resolve(machineMacAddress);
            return;
        }

        /** Read the machine mac address */
        getMac.getMac((err: Error, rawMacAddress: string) => {

            if (err) {
                logger.error('Cant read local MAC address');
                reject(err);
                return;
            }

            /** Format mac address to correct format. */
            machineMacAddress = rawMacAddress.replace(/:|-|_| /g, '').toLowerCase();
            resolve(machineMacAddress);
        });
    });
};
