import * as ip from 'ip';
import * as isOnline from 'is-online';
import * as networkList2 from 'network-list2';
import { Configuration } from '../config';
import { LocalNetworkDevice } from '../models/sharedInterfaces';
import { logger } from './logger';
import { GetMachinMacAddress } from './macAddress';

/**
 * Get the all local network devices.
 */
export const LocalNetworkReader = (): Promise<LocalNetworkDevice[]> => {
    logger.info('Scanning network devices...');
    return new Promise(async (resolve, reject) => {

        const ops: { ip?: string; vendor?: boolean } = {};

        /** Ceck if internet connection is online, otherways dont try to get vendor name. */
        const isInternetOnline = await isOnline();

        if (Configuration.scanSubnet) {
            ops.ip = Configuration.scanSubnet;
            ops.vendor = isInternetOnline;
        }

        networkList2.scan(ops, (err: any, netTableArray: any[]) => {
            logger.info('Scanning network devices done.');
            if (err) {
                const msg = 'Scen local network fail';
                logger.warn(msg);
                reject(msg);
                return;
            }

            const devices: LocalNetworkDevice[] = [];

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
