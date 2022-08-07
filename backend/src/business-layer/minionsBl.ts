import * as moment from 'moment';
import * as randomstring from 'randomstring';
import { MinionsDal, MinionsDalSingleton } from '../data-layer/minionsDal';
import {
	DeviceKind,
	ErrorResponse,
	LocalNetworkDevice,
	Minion,
	MinionCalibrate,
	MinionFeed,
	MinionChangeTrigger,
	MinionStatus,
	ProgressStatus,
	User,
} from '../models/sharedInterfaces';
import { ModulesManager, modulesManager } from '../modules/modulesManager';
import { DeepCopy } from '../utilities/deepCopy';
import { logger } from '../utilities/logger';
import { Delay, sleep } from '../utilities/sleep';
import { DevicesService, devicesService } from './devicesBl';
import { SyncEvent } from 'ts-events';
import { Duration } from 'unitsnet-js';

const DELAY_FOR_MINIONS_MISSING_DEVICE_SCAN = Duration.FromMinutes(2);

export class MinionsBl {
	/**
	 * Minions status update feed.
	 */
	public minionFeed = new SyncEvent<MinionFeed>();
	// Dependencies
	private minionsDal: MinionsDal;
	private devicesBl: DevicesService;
	private modulesManager: ModulesManager;
	private scanningStatus: ProgressStatus = 'finished';

	/**
	 * minions
	 */
	private minions: Minion[] = [];
	/**
	 * The current minion in "setting" mode flag
	 * Used to avoid race between the module that call the "set" and the device module change update to the timeline
	 */
	private settingStatusMode: string = '';

	/**
	 * Init minions bl. using dependency injection pattern to allow units testings.
	 * @param minionsDal Inject the dal instance.
	 */
	constructor(minionsDal: MinionsDal, devicesBl: DevicesService, modulesManager: ModulesManager) {
		this.minionsDal = minionsDal;
		this.devicesBl = devicesBl;
		this.modulesManager = modulesManager;
	}

	/**
	 * API
	 */

	/**
	 * Gets minions array.
	 */
	public async getMinions(): Promise<Minion[]> {
		return this.minions;
	}

	/**
	 * Get minion by id.
	 * @param minionId minion id.
	 */
	public async getMinionById(minionId: string): Promise<Minion> {
		const minion = this.findMinion(minionId);

		if (!minion) {
			throw {
				responseCode: 1404,
				message: 'minion not exist',
			} as ErrorResponse;
		}
		return minion;
	}

	/**
	 * Scan all minions real status.
	 * mean, update minions cache by request each device what is the real status.
	 * @param scanNetwork Whenever scan also the local networks IP's map or not.
	 */
	public async scanMinionsStatus(scanNetwork: boolean = false): Promise<void> {
		if (this.scanningStatus !== 'inProgress') {
			this.scanMinionsNetworkAndStatuses(scanNetwork);
		}
	}

	/**
	 * Get the current scanning status
	 */
	public getScanningStatus(): ProgressStatus {
		return this.scanningStatus;
	}

	/**
	 * Scan minion real status.
	 * mean update minions cache by request the device what is the real status.
	 */
	public async scanMinionStatus(minionId: string): Promise<void> {
		const minion = this.findMinion(minionId);
		if (!minion) {
			throw {
				responseCode: 1404,
				message: 'minion not exist',
			} as ErrorResponse;
		}
		await this.readMinionStatus(minion);
	}

	/**
	 * Rename minion.
	 * @param minionId minion id.
	 * @param nameToSet the new name to set.
	 */
	public async renameMinion(minionId: string, nameToSet: string): Promise<void> {
		const minion = this.findMinion(minionId);
		if (!minion) {
			throw {
				responseCode: 1404,
				message: 'minion not exist',
			} as ErrorResponse;
		}

		minion.name = nameToSet;

		try {
			await this.minionsDal.renameMinion(minionId, nameToSet);
		} catch (error) {
			logger.warn(`Fail to update minion ${minionId} with new name ${error.message}`);
		}

		/**
		 * Send minions feed update.
		 */
		this.minionFeed.post({
			event: 'update',
			minion,
		});
	}

	/**
	 * Set minion room.
	 * @param minionId minion id.
	 * @param nameToSet the new room name to set.
	 */
	public async setMinionRoom(minionId: string, nameToSet: string): Promise<void> {
		const minion = this.findMinion(minionId);
		if (!minion) {
			throw {
				responseCode: 1404,
				message: 'minion not exist',
			} as ErrorResponse;
		}

		minion.room = nameToSet;

		try {
			await this.minionsDal.setMinionRoom(minionId, nameToSet);
		} catch (error) {
			logger.warn(`Fail to update room of minion ${minionId} with new name ${error.message}`);
		}

		/**
		 * Send minions feed update.
		 */
		this.minionFeed.post({
			event: 'update',
			minion,
		});
	}

	/**
	 * Set minion status
	 * @param minionId minion to set new status to.
	 * @param minionStatus the status to set.
	 */
	public async setMinionStatus(minionId: string, minionStatus: MinionStatus, minionSetTrigger: MinionChangeTrigger, userAction?: User): Promise<void> {
		const minion = this.findMinion(minionId);
		if (!minion) {
			throw {
				responseCode: 1404,
				message: 'minion not exist',
			} as ErrorResponse;
		}

		/**
		 * The minion status is depend on minion type.
		 */
		if (!minionStatus[minion.minionType]) {
			throw {
				responseCode: 1405,
				message: 'incorrect minion status for current minion type',
			} as ErrorResponse;
		}

		/** Make sure the calibration lock are not ignored */
		if (minion.calibration && minion.calibration.calibrationCycleMinutes) {
			if (minionStatus[minion.minionType].status === 'on' && minion.calibration.calibrationMode === 'LOCK_OFF') {
				throw {
					responseCode: 7405,
					message: 'cant change status, the current status are locked',
				} as ErrorResponse;
			}

			if (minionStatus[minion.minionType].status === 'off' && minion.calibration.calibrationMode === 'LOCK_ON') {
				throw {
					responseCode: 7405,
					message: 'cant change status, the current status are locked',
				} as ErrorResponse;
			}
		}

		// Mark the minion as "setting mode"
		this.settingStatusMode = minion.minionId;
		/**
		 * set the status.
		 */
		await this.modulesManager.setStatus(minion, minionStatus).catch(err => {
			minion.isProperlyCommunicated = false;
			this.minionFeed.post({
				event: 'update',
				minion,
			});
			// Remove the minion as "setting mode"
			this.settingStatusMode = '';
			throw err;
		});
		// Remove the minion as "setting mode"
		this.settingStatusMode = '';

		/** If there is no change from the last minion status */
		if (minion.isProperlyCommunicated && JSON.stringify(minion.minionStatus) === JSON.stringify(minionStatus)) {
			return;
		}

		minion.isProperlyCommunicated = true;

		/**
		 * If success, update minion to new status.
		 */
		minion.minionStatus = minionStatus;

		/**
		 * Send minions feed update.
		 */
		this.minionFeed.post({
			event: 'update',
			minion,
			trigger: minionSetTrigger,
			user: userAction
		});
	}

	/**
	 * Set minion timeout property.
	 */
	public async setMinionTimeout(minionId: string, setAutoTurnOffMS: number): Promise<void> {
		const minion = this.findMinion(minionId);
		if (!minion) {
			throw {
				responseCode: 1404,
				message: 'minion not exist',
			} as ErrorResponse;
		}

		minion.minionAutoTurnOffMS = setAutoTurnOffMS;

		/**
		 * Save timeout update in Dal for next app running.
		 */
		this.minionsDal.updateMinionAutoTurnOff(minionId, setAutoTurnOffMS).catch((error: ErrorResponse) => {
			logger.warn(`Fail to update minion ${minionId} auto turn off ${error.message}`);
		});

		/**
		 * Send minion feed update
		 */
		this.minionFeed.post({
			event: 'update',
			minion,
		});
	}

	/**
	 * Set minion calibrate property.
	 */
	public async setMinionCalibrate(minionId: string, minionCalibrate: MinionCalibrate): Promise<void> {
		const minion = this.findMinion(minionId);
		if (!minion) {
			throw {
				responseCode: 1404,
				message: 'minion not exist',
			} as ErrorResponse;
		}

		minion.calibration = minionCalibrate;

		/**
		 * .
		 */
		try {
			/** Save calibration update in Dal for next calibration activation */
			this.minionsDal.updateMinionCalibrate(minionId, minionCalibrate);

			/**
			 * Send minion feed update
			 */
			this.minionFeed.post({
				event: 'update',
				minion,
			});

			// Change minion status only if the current is violated the new lock
			if (minionCalibrate.calibrationMode === 'AUTO' || !minionCalibrate.calibrationCycleMinutes) {
				return;
			}

			const currentStatus = minion.minionStatus[minion.minionType].status;

			const statusToSet = DeepCopy<MinionStatus>(minion.minionStatus);
			let needToSetStatus = false;

			if (currentStatus === 'on' && minionCalibrate.calibrationMode === 'LOCK_OFF') {
				statusToSet[minion.minionType].status = 'off';
				needToSetStatus = true;
			}

			if (currentStatus === 'off' && minionCalibrate.calibrationMode === 'LOCK_ON') {
				statusToSet[minion.minionType].status = 'on';
				needToSetStatus = true;
			}

			if (needToSetStatus) {
				try {
					await this.setMinionStatus(minionId, statusToSet, 'lock');
				} catch (error) {
					logger.warn(`[MinionsBL] Failed to change minion "${minionId}" status, according to the new lock`);
				}
			}
		} catch (error) {
			logger.warn(`Fail to update minion ${minionId} auto turn off ${error.message}`);
			throw {
				responseCode: 12501,
				message: 'Setting calibration failed',
			} as ErrorResponse;
		}
	}

	/**
	 * Set all minions status off.
	 */
	public async powerAllOff(user: User) {
		logger.info(`Setting all minions power off ...`);

		for (const minion of this.minions) {
			try {
				const statusToSet = DeepCopy<MinionStatus>(minion.minionStatus);
				statusToSet[minion.minionType].status = 'off';
				await this.setMinionStatus(minion.minionId, statusToSet, 'user', user);
			} catch (error) {
				logger.warn(`Set minion ${minion.minionId} power off failed, ${error ? error.message : 'unknown'}`);
			}
		}
	}

	/**
	 * Create new minion
	 * @param minion minion to create.
	 */
	public async createMinion(minion: Minion): Promise<void> {
		/**
		 * check if minion valid.
		 */
		const error = this.validateNewMinion(minion);
		if (error) {
			throw error;
		}

		/**
		 * get local devices (to load current physical info such as ip)
		 */
		const localDevices = await this.devicesBl.getDevices();
		let foundLocalDevice = false;
		for (const localDevice of localDevices) {
			if (localDevice.mac === minion.device.pysicalDevice.mac) {
				minion.device.pysicalDevice = localDevice;
				foundLocalDevice = true;
				break;
			}
		}

		if (!foundLocalDevice) {
			throw {
				responseCode: 2404,
				message: 'device not exist in lan network',
			} as ErrorResponse;
		}

		/**
		 * Generate new id. (never trust client....)
		 */
		minion.minionId = randomstring.generate(6);

		/**
		 * Create new minion in dal.
		 */
		await this.minionsDal.createMinion(minion);

		/**
		 * Send create new minion feed update (*before* try to get the status!!!)
		 */
		this.minionFeed.post({
			event: 'created',
			minion,
		});

		/**
		 * Try to get current status.
		 */
		try {
			await this.readMinionStatus(minion);
		} catch (error) { }
	}

	/**
	 * Delete minion
	 * @param minionId minion id to delete
	 */
	public async deleteMinion(minionId: string): Promise<void> {
		const originalMinion = this.findMinion(minionId);
		if (!originalMinion) {
			throw {
				responseCode: 1404,
				message: 'minion not exist',
			} as ErrorResponse;
		}

		await this.minionsDal.deleteMinion(originalMinion);

		// The minions array is given from DAL by ref, mean if removed
		// from dal it will removed from BL too, so check if exist
		// (if in next someone will copy by val) and then remove.
		if (this.minions.indexOf(originalMinion) !== -1) {
			this.minions.splice(this.minions.indexOf(originalMinion), 1);
		}

		this.minionFeed.post({
			event: 'removed',
			minion: originalMinion,
		});

		// Finally clean module communication
		await this.modulesManager.refreshModule(originalMinion.device.brand);
	}

	/**
	 * Init minions.
	 */
	public async initMinionsModule(): Promise<void> {
		/** Mark scanning as 'inProgress' */
		this.scanningStatus = 'inProgress';

		/**
		 * Gets all minions
		 */
		this.minions = await this.minionsDal.getMinions();

		/**
		 * Scan network on startup
		 */
		await this.devicesBl.rescanNetwork();

		/**
		 * Get network local devices
		 */
		const localDevices = await this.devicesBl.getDevices();

		/**
		 * Then load minion with new physical network data
		 */
		await this.loadMinionsLocalDeviceData(localDevices);

		/**
		 * Let`s modules retrieve updated minions array.
		 */
		modulesManager.retrieveMinions.setPullMethod(
			async (): Promise<Minion[]> => {
				return await this.getMinions();
			},
		);

		/**
		 * After all, subscribe to devices status updates.
		 */
		this.modulesManager.minionStatusChangedEvent.attach(async physicalDeviceUpdate => {
			if (!physicalDeviceUpdate) {
				return;
			}

			try {
				const minion = await this.getMinionById(physicalDeviceUpdate.minionId);
				await this.onMinionUpdated(minion, physicalDeviceUpdate.status);
			} catch (error) {
				logger.info(`Avoiding device update, there is no minion with id: ${physicalDeviceUpdate.minionId}`);
			}
		});

		/**
		 * And also register to devices pysical data update (name or ip).
		 */
		this.devicesBl.devicesUpdate.attach((localsDevices: LocalNetworkDevice[]) => {
			this.loadMinionsLocalDeviceData(localsDevices);
		});

		/**
		 * Finally, after all, get minions status.
		 */
		await this.readMinionsStatus();

		/** Now mark all tasks finished */
		this.scanningStatus = 'finished';

		this.scanMissingDevices();
	}

	/**
	 * In case of network not yet fully discovered due to timing in machine upload or any other reason
	 * Scan network till all minions IPs will be discovered
	 * @returns 
	 */
	private async scanMissingDevices() {
		while (true) {
			// Sleep for a while
			await sleep(DELAY_FOR_MINIONS_MISSING_DEVICE_SCAN);
			// Get all minion without a valid IP discovered during initialization.
			const missingDevices = this.minions.filter(m => !m?.device?.pysicalDevice?.ip);

			// If all discovered, abort.
			if (missingDevices.length === 0) {
				logger.info(`[MinionsBl.scanMissingDevices] All minion has IP, initialization process done`);
				return;
			}

			logger.info(`[MinionsBl.scanMissingDevices] Minions "${missingDevices.map(m => m.minionId).join(',')}" does not have yet IP, about to scan again...`);

			try {
				// Scan network again
				await this.devicesBl.rescanNetwork();

				// Try get status for all missing IP minions
				for (const minion of missingDevices) {
					if (!minion?.device?.pysicalDevice?.ip) {
						logger.info(`[MinionsBl.scanMissingDevices] Minion "${minion.minionId}:${minion.name}" still dont has IP`);
						continue;
					}

					try {
						logger.info(`[MinionsBl.scanMissingDevices] About to read minions "${minion.minionId}" status`);
						await this.readMinionStatus(minion);
						logger.info(`[MinionsBl.scanMissingDevices] Minions "${minion.minionId}" status updated successfully`);
					} catch (error) {
						logger.error(`[MinionsBl.scanMissingDevices] Failed to read minions "${minion.minionId}" status "${error.message}" `);
					}
				}
			} catch (error) {
				logger.error(`[MinionsBl.scanMissingDevices] Failed to scan network "${error.message}" `);
			}
		}
	}

	/**
	 * Load minion devices data
	 * @param localDevices local device array.
	 */
	private async loadMinionsLocalDeviceData(localDevices: LocalNetworkDevice[]): Promise<void> {
		/**
		 * Each device check each used minion.
		 */
		for (const localDevice of localDevices) {
			for (const minion of this.minions) {
				if (minion.device.pysicalDevice.mac === localDevice.mac) {
					minion.device.pysicalDevice = localDevice;
				}
			}
		}
	}

	/**
	 * Read minion current status.
	 * @param minion minion to read status for.
	 */
	private async readMinionStatus(minion: Minion) {
		try {
			const currentStatus: MinionStatus = (await this.modulesManager.getStatus(minion)) as MinionStatus;

			await this.onMinionUpdated(minion, currentStatus);
		} catch (error) {
			minion.isProperlyCommunicated = false;
			logger.warn(`Fail to read status of ${minion.name} id: ${minion.minionId} err : ${error.message}`);
			throw error;
		}
	}

	/**
	 * Read each minion current status.
	 */
	private async readMinionsStatus(): Promise<void> {
		for (const minion of this.minions) {
			/**
			 * Read current minion status.
			 */
			await this.readMinionStatus(minion).catch(() => {
				/**
				 * Fail, do nothing....
				 */
			});

			/**
			 * Let time between minions reading.
			 * this is because some of devices using broadcast in network and can't communication 2 together.
			 */
			await Delay(moment.duration(1, 'seconds'));
		}
	}

	/**
	 * Find minion in minions array.
	 * @param minionId minion id.
	 */
	private findMinion(minionId: string): Minion {
		for (const minion of this.minions) {
			if (minion.minionId === minionId) {
				return minion;
			}
		}
	}

	private async onMinionUpdated(minion: Minion, updateToStatus: MinionStatus) {

		// If the current minion in "set status" mode
		// don't override the setter module to be the one that updating the new status
		if (this.settingStatusMode === minion.minionId) {
			return;
		}

		/** If there is no change from last minion status */
		if (minion.isProperlyCommunicated && JSON.stringify(minion.minionStatus) === JSON.stringify(updateToStatus)) {
			return;
		}

		minion.isProperlyCommunicated = true;
		minion.minionStatus = updateToStatus;
		this.minionFeed.post({
			event: 'update',
			minion,
			trigger: 'device'
		});
	}

	/**
	 * Validate new minion properties to make sure that they compatible to requires.
	 * @param minionToCheck new minion to validate.
	 */
	private validateNewMinion(minionToCheck: Minion): ErrorResponse {
		/**
		 * Get brand & model
		 */
		let deviceKind: DeviceKind;
		for (const kind of this.modulesManager.devicesKind) {
			if (kind.brand === minionToCheck.device.brand && kind.model === minionToCheck.device.model) {
				deviceKind = kind;
			}
		}

		/**
		 * Check that model exits in barns.
		 */
		if (!deviceKind) {
			return {
				responseCode: 1409,
				message: 'there is no supported model for brand + model',
			};
		}

		/**
		 * Check if token reqired and not exist.
		 */
		if (deviceKind.isTokenRequired && !minionToCheck.device.token) {
			return {
				responseCode: 2409,
				message: 'token is requird',
			};
		}

		/**
		 * Check if id reqired and not exist.
		 */
		if (deviceKind.isIdRequired && !minionToCheck.device.deviceId) {
			return {
				responseCode: 3409,
				message: 'id is required',
			};
		}

		/**
		 * If the model is not for unlimited minions count the used minions.
		 */
		if (deviceKind.minionsPerDevice !== -1) {
			let minionsCount = 0;
			for (const minion of this.minions) {
				if (minion.device.pysicalDevice.mac === minionToCheck.device.pysicalDevice.mac) {
					minionsCount++;
				}
			}

			/**
			 * If the new minion is above max minions per device.
			 */
			if (minionsCount >= deviceKind.minionsPerDevice) {
				return {
					responseCode: 4409,
					message: 'device already in max uses with other minion',
				};
			}
		}

		/**
		 * ignore user selection and set corrent minion type based on model.
		 */
		minionToCheck.minionType = deviceKind.supportedMinionType;
	}

	/**
	 * Scan the minions current status
	 * @param scanNetwork Whenever scan also the local networks IP's map or not.
	 */
	private async scanMinionsNetworkAndStatuses(scanNetwork: boolean = false) {
		this.scanningStatus = 'inProgress';
		try {
			if (scanNetwork) {
				await this.devicesBl.rescanNetwork();
			}
			await this.modulesManager.refreshModules();
			await this.readMinionsStatus();
		} catch (error) {
			logger.warn(`Scanning minions ${scanNetwork ? 'with network' : ''} failed ${JSON.stringify(error)}`);
			this.scanningStatus = 'fail';
			return;
		}
		this.scanningStatus = 'finished';
	}
}

export const MinionsBlSingleton = new MinionsBl(MinionsDalSingleton, devicesService, modulesManager);
