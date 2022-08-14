import * as ip from 'ip';
import * as isOnline from 'is-online';
import { Configuration } from '../config';
import { LocalNetworkDevice } from '../models/sharedInterfaces';
import { logger } from './logger';
import { scanLocalNetwork } from 'local-network-scan';

/**
 * Scan local network devices 
 * @returns LocalNetworkDevice collection
 */
export async function LocalNetworkReader(): Promise<LocalNetworkDevice[]> {

	/** Check if internet connection is online, otherwise don't try to get vendor name. */
	const isInternetOnline = await isOnline();

	if (Configuration.runningMode === 'test') {
		return [];
	}

	try {
		logger.info('[LocalNetworkReader] Scanning network devices...');
		const networkDevices = await scanLocalNetwork({ logger, localNetwork: Configuration.scanSubnet, queryVendor: false });
		logger.info('[LocalNetworkReader] Scanning network devices done.');

		const devices: LocalNetworkDevice[] = [];
		/** Add current machine info to table (without the MAC address!!!, then mac used as part of the default authentication) */
		devices.push({
			mac: '------------',
			ip: ip.address(),
			vendor: 'Casanet Local Server',
		});

		for (const localDevice of networkDevices) {
			// Skip devices without mac
			if (!localDevice.mac) {
				continue;
			}
			devices.push({
				// Show clean MAC string without ':', '-' or '_'
				mac: localDevice.mac?.replace(/:|-|_| /g, '').toLowerCase(),
				ip: localDevice.ip,
				vendor: localDevice.vendor,
			});
		}
		return devices;
	} catch (error) {
		if (error.message === 'Timeout') {
			console.error('[LocalNetworkReader] Scanning network devices scanning timeout');
		}
		logger.error(`[LocalNetworkReader] Scanning network devices failed - ${error?.message}`);
		return [];
	}
}
