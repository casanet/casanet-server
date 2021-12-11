import * as moment from 'moment';
import * as Tuyapi from 'tuyapi';
import { CommandsSet } from '../../models/backendInterfaces';
import {
	DeviceKind,
	ErrorResponse,
	Minion,
	MinionDevice,
	MinionStatus,
	RollerDirection,
	SwitchOptions,
} from '../../models/sharedInterfaces';
import { logger } from '../../utilities/logger';
import { Delay } from '../../utilities/sleep';
import { BrandModuleBase } from '../brandModuleBase';

/** The Tuya communication chanel is sensitive, so each X time disconnect and reconnect it */
const MAX_SAME_CONNECTION_USES_MS = 1000 * 60 * 10; // each 10 minutes

export class TuyaHandler extends BrandModuleBase {
	public readonly brandName: string = 'tuya';

	public readonly devices: DeviceKind[] = [
		{
			brand: this.brandName,
			isTokenRequired: true,
			isIdRequired: true,
			minionsPerDevice: 3,
			model: 'wall switch, 3 gangs, first one',
			supportedMinionType: 'switch',
			isRecordingSupported: false,
			isFetchCommandsAvailable: false,
		},
		{
			brand: this.brandName,
			isTokenRequired: true,
			isIdRequired: true,
			minionsPerDevice: 3,
			model: 'wall switch, 3 gangs, second one',
			supportedMinionType: 'switch',
			isRecordingSupported: false,
			isFetchCommandsAvailable: false,
		},
		{
			brand: this.brandName,
			isTokenRequired: true,
			isIdRequired: true,
			minionsPerDevice: 3,
			model: 'wall switch, 3 gangs, third one',
			supportedMinionType: 'switch',
			isRecordingSupported: false,
			isFetchCommandsAvailable: false,
		},
		{
			brand: this.brandName,
			isTokenRequired: true,
			isIdRequired: true,
			minionsPerDevice: 1,
			model: 'curtain',
			supportedMinionType: 'roller',
			isRecordingSupported: false,
			isFetchCommandsAvailable: false,
		},
	];

	/**
	 * Map devices by mac address
	 */
	private physicalDevicesMap: { [key: string]: Tuyapi } = {};

	/** Cache last status, to ignore unnecessary updates.  */
	private devicesStatusCache: { [key: string]: any } = {};

	constructor() {
		super();
	}

	public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
		/**
		 * Get tuya device instance
		 */
		const tuyaDevice = await this.getTuyaDevice(minion.device);

		if (minion.device.model.includes('curtain')) {
			try {
				const rowStatus = await tuyaDevice.get();

				return {
					roller: {
						status: rowStatus !== '3' ? 'on' : 'off',
						direction: rowStatus === '1' ? 'up' : 'down',
					},
				};
			} catch (err) {
				tuyaDevice.error = true;

				logger.warn(`Fail to get status of ${minion.minionId}, ${err}`);

				if (typeof err === 'object' && err.message === 'fffffffffffffff') {
					throw {
						responseCode: 9503,
						message:
							'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
					} as ErrorResponse;
				}

				throw {
					responseCode: 1503,
					message: 'communication with tuya device fail',
				} as ErrorResponse;
			}
		}

		const stausResult = await tuyaDevice.get({ schema: true }).catch((err: Error) => {
			tuyaDevice.error = true;

			logger.warn(`Fail to get status of ${minion.minionId}, ${err}`);

			if (
				typeof err === 'object' &&
				err.message ===
				'Error communicating with device. Make sure nothing else is trying to control it or connected to it.'
			) {
				throw {
					responseCode: 9503,
					message:
						'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
				} as ErrorResponse;
			}

			throw {
				responseCode: 1503,
				message: 'communication with tuya device fail',
			} as ErrorResponse;
		});

		/** Case stausResult get a garbage value */
		if (typeof stausResult !== 'object' || !stausResult.dps) {
			tuyaDevice.error = true;

			throw {
				responseCode: 10503,
				message: 'tuya device gives garbage values.',
			} as ErrorResponse;
		}

		/**
		 * Extract the current minion status.
		 */
		let currentGangStatus: boolean;
		switch (minion.device.model) {
			case 'wall switch, 3 gangs, first one':
				currentGangStatus = stausResult.dps[1];
				break;
			case 'wall switch, 3 gangs, second one':
				currentGangStatus = stausResult.dps[2];
				break;
			case 'wall switch, 3 gangs, third one':
				currentGangStatus = stausResult.dps[3];
				break;
		}

		return {
			switch: {
				status: currentGangStatus ? 'on' : 'off',
			},
		};
	}

	public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
		/**
		 * Get tuya device instance
		 */
		const tuyaDevice = await this.getTuyaDevice(minion.device);

		if (minion.device.model.includes('curtain')) {
			try {
				await tuyaDevice.set({
					set: setStatus.roller.status === 'off' ? '3' : setStatus.roller.direction === 'up' ? '1' : '2',
				});
				return;
			} catch (err) {
				tuyaDevice.error = true;
				logger.warn(`Fail to get status of ${minion.minionId}, ${err}`);

				if (
					typeof err === 'object' &&
					err.message ===
					'Error communicating with device. Make sure nothing else is trying to control it or connected to it.'
				) {
					throw {
						responseCode: 9503,
						message:
							'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
					} as ErrorResponse;
				}

				throw {
					responseCode: 1503,
					message: 'communication with tuya device fail',
				} as ErrorResponse;
			}
		}

		/**
		 * Get current minion gang index.
		 */
		let gangIndex: number;
		switch (minion.device.model) {
			case 'wall switch, 3 gangs, first one':
				gangIndex = 1;
				break;
			case 'wall switch, 3 gangs, second one':
				gangIndex = 2;
				break;
			case 'wall switch, 3 gangs, third one':
				gangIndex = 3;
				break;
		}

		await tuyaDevice.set({ set: setStatus.switch.status === 'on', dps: gangIndex }).catch(err => {
			tuyaDevice.error = true;
			logger.warn(`Fail to get status of ${minion.minionId}, ${err}`);

			if (
				typeof err === 'object' &&
				err.message ===
				'Error communicating with device. Make sure nothing else is trying to control it or connected to it.'
			) {
				throw {
					responseCode: 9503,
					message:
						'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
				} as ErrorResponse;
			}

			throw {
				responseCode: 1503,
				message: 'communication with tuya device fail',
			} as ErrorResponse;
		});
	}

	public async enterRecordMode(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
		throw {
			responseCode: 6409,
			message: 'the tuya module not support any recording mode',
		} as ErrorResponse;
	}

	public async generateCommand(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
		throw {
			responseCode: 6409,
			message: 'the tuya module not support any recording mode',
		} as ErrorResponse;
	}

	public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
		// There's nothing to do.
	}

	public async refreshCommunication(): Promise<void> {
		for (const tuyaApi of Object.values(this.physicalDevicesMap)) {
			try {
				await tuyaApi.disconnect();
			} catch (error) {
				logger.warn(`[tuyaAPI.refreshCommunication] disconnecting device ${tuyaApi.mac} error ${error.message || JSON.stringify(error)}`)
			}
		}
		this.physicalDevicesMap = {};
	}

	/**
	 * Get tuya device API instance.
	 * @param minionDevice The minion device property. to get tuya instance for.
	 * @returns tuya device API instance
	 */
	private async getTuyaDevice(minionDevice: MinionDevice): Promise<any> {

		// If time from the last reconnecting is less then 2 minutes, use the same communication chanel.

		const tuyaApiObject = this.physicalDevicesMap[minionDevice.pysicalDevice.mac];

		if (tuyaApiObject) {

			const now = new Date().getTime();

			// Do it only in case of error in first attempt, why every time.
			// If there is no any error in the previous action, and the chanel liveliness is not too long, use the same chanel 
			if (!tuyaApiObject.error && now - tuyaApiObject.connectionTimeout < MAX_SAME_CONNECTION_USES_MS) {
				return tuyaApiObject;
			}

			try {
				logger.info(`[tuyaAPI.getTuyaDevice] About to softly disconnect ${tuyaApiObject.mac} ...`);
				await tuyaApiObject.disconnect();
			} catch (error) {
				logger.warn(`[tuyaAPI.getTuyaDevice] disconnecting device ${tuyaApiObject.mac} error ${error.message || JSON.stringify(error)}`)
			}
		}

		try {
			logger.info(`[tuyaAPI.getTuyaDevice] About to open new TCP channel for "${minionDevice.pysicalDevice.mac}" ...`);
			// Create the new instance
			const newTuyaApiObject = new Tuyapi({
				id: minionDevice.deviceId,
				key: minionDevice.token,
				// persistentConnection: true, // Dot flag it ON, to make sure in new creation that the old TCP is closed
			});

			// Find the device in the network
			await newTuyaApiObject.find();

			// Connect to it (TCP channel)
			await newTuyaApiObject.connect();

			newTuyaApiObject.mac = minionDevice.pysicalDevice.mac;
			newTuyaApiObject.connectionTimeout = new Date().getTime();

			// Keep the device, but only!!! if the reconnection succeed, (else don't remove the old TCP from map, just try to use it,)
			this.physicalDevicesMap[minionDevice.pysicalDevice.mac] = newTuyaApiObject;

			await this.watchDevice(newTuyaApiObject, minionDevice);
			logger.info(`[tuyaAPI.getTuyaDevice] Open new TCP channel for "${minionDevice.pysicalDevice.mac}" succeed`);
			return newTuyaApiObject;
		} catch (error) {
			logger.warn(`[tuyaAPI.getTuyaDevice] Creating new Tuya api object failed ${tuyaApiObject.mac} error ${error.message || JSON.stringify(error)}`);
			try {
				await tuyaApiObject.disconnect();
			} catch (error) {
				logger.warn(`[tuyaAPI.getTuyaDevice] Disconnecting new attempt failed ${tuyaApiObject.mac} error ${error.message || JSON.stringify(error)}`);
			}
		}

		logger.info(`[tuyaAPI.getTuyaDevice] return tuya object ${tuyaApiObject.mac}`);
		// Return the instance, ready to use.
		return tuyaApiObject;
	}

	/**
	 * On the set/get finished, call to this method to keep device and subscribe status events
	 * @param tuyaDevice 
	 * @param minionDevice 
	 */
	private async watchDevice(tuyaDevice: Tuyapi, minionDevice: MinionDevice) {

		/**
		 * Subscribe to status changed event.
		 */
		tuyaDevice.on('data', async (data: any) => {
			/** Case data arrived with garbage value */
			if (typeof data === 'string') {
				return;
			}

			/** If data same as cached, abort. */
			if (this.devicesStatusCache[minionDevice.pysicalDevice.mac] === JSON.stringify(data)) {
				return;
			}
			/** Save data as last status cache. */
			this.devicesStatusCache[minionDevice.pysicalDevice.mac] = JSON.stringify(data);

			logger.debug(`tuya device mac: ${minionDevice.pysicalDevice.mac} data arrived`);

			if (minionDevice.model.includes('curtain')) {
				try {
					const rowStatus = await tuyaDevice.get();

					const minions = await this.retrieveMinions.pull();

					for (const minion of minions) {
						/**
						 * Find the minions that used current pysical tuya device
						 */
						if (minion.device.deviceId !== minionDevice.deviceId) {
							continue;
						}

						logger.debug(`[tuyaHandler] minion "${minion.minionId}" status arrived from device ${JSON.stringify(rowStatus)}`);

						const status: SwitchOptions = rowStatus !== '3' ? 'on' : 'off';
						const direction: RollerDirection = rowStatus === '1' ? 'up' : 'down';

						this.minionStatusChangedEvent.post({
							minionId: minion.minionId,
							status: {
								roller: {
									status,
									direction,
								},
							},
						});
					}
				} catch (error) { }
				return;
			}
			/**
			 * Get the current status (the 'data' paramerer is invalid)
			 */
			tuyaDevice.get({ schema: true }).then(status => {
				/** Case status get a garbage value */
				if (typeof status !== 'object' || !status.dps) {
					return;
				}

				/**
				 * Pull the current minions array in system.
				 */
				this.retrieveMinions.pull().then(minions => {
					for (const minion of minions) {
						/**
						 * Find the minions that used current pysical tuya device
						 */
						if (minion.device.deviceId !== minionDevice.deviceId) {
							continue;
						}

						logger.debug(`[tuyaHandler] minion "${minion.minionId}" status arrived from device ${JSON.stringify(status)}`);

						/**
						 * Then read the current status for specific model and
						 * send new status update to all subsribers.
						 */
						if (minion.device.model === 'wall switch, 3 gangs, first one') {
							this.minionStatusChangedEvent.post({
								minionId: minion.minionId,
								status: {
									switch: {
										status: status.dps['1'] ? 'on' : 'off',
									},
								},
							});
						}

						if (minion.device.model === 'wall switch, 3 gangs, second one') {
							this.minionStatusChangedEvent.post({
								minionId: minion.minionId,
								status: {
									switch: {
										status: status.dps['2'] ? 'on' : 'off',
									},
								},
							});
						}

						if (minion.device.model === 'wall switch, 3 gangs, third one') {
							this.minionStatusChangedEvent.post({
								minionId: minion.minionId,
								status: {
									switch: {
										status: status.dps['3'] ? 'on' : 'off',
									},
								},
							});
						}
					}
				});
			});
		});

		tuyaDevice.on('connected', () => {
			logger.debug(`[tuyaHandler] tuya device mac: "${minionDevice.pysicalDevice.mac}" connected`);
		});

		tuyaDevice.on('disconnected', () => {
			logger.debug(`[tuyaHandler] tuya device mac: "${minionDevice.pysicalDevice.mac}" disconnected`);
		});

		/**
		 * Subscribe to error event.
		 */
		tuyaDevice.on('error', async (err: any) => {
			logger.debug(`[tuyaHandler] tuya device mac: "${minionDevice.pysicalDevice.mac}" error: ${err.message} ${err.stack || JSON.stringify(err)}`);

			try {
				// Not sure if this a good idea to try disconnet from error socket
				// tuyaDevice.disconnect();
				delete this.physicalDevicesMap[minionDevice.pysicalDevice.mac];

				await Delay(moment.duration(5, 'seconds'));
				// Do not try to reconnect auto, to avoid infinity circular run 
				// await this.getTuyaDevice(minionDevice);
			} catch (error) {
				logger.warn(
					`reconnecting TCP connection to the tuya mac: ${minionDevice.pysicalDevice.mac} fail error: ${error}`,
				);
			}
		});
	}


}
