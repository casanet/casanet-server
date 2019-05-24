import * as networkList2 from 'network-list2';
import { LocalNetworkDevice } from '../models/sharedInterfaces';
import { logger } from './logger';
import { Configuration } from '../config';

/**
 * Get the all local network devices.
 */
export const LocalNetworkReader = (): Promise<LocalNetworkDevice[]> => {
    logger.info('Scanning network devices...');
    return new Promise((resolve, reject) => {

        const ops: { ip?: string } = {};
        if (Configuration.scanSubnet) {
            ops.ip = Configuration.scanSubnet;
        }

        networkList2.scan(ops, (err, netTableArray: any[]) => {
            logger.info('Scanning network devices done.');
            if (err) {
                const msg = 'Scen local network fail';
                logger.warn(msg);
                reject(msg);
                return;
            }

            const devices: LocalNetworkDevice[] = [];
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
