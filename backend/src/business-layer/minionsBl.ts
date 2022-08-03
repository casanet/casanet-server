import * as moment from 'moment';
import * as randomstring from 'randomstring';
import { MinionsDal, MinionsDalSingleton } from '../data-layer/minionsDal';
import {
	DeviceKind,
	ErrorResponse,
	IftttOnChanged,
	LocalNetworkDevice,
	Minion,
	MinionCalibrate,
	MinionFeed,
	MinionChangeTrigger,
	MinionStatus,
	ProgressStatus,
	User,
} from '../models/sharedInterfaces';
import { ModulesManager, ModulesManagerSingltone } from '../modules/modulesManager';
import { DeepCopy } from '../utilities/deepCopy';
import { logger } from '../utilities/logger';
import { Delay } from '../utilities/sleep';
import { DevicesBl, DevicesBlSingleton } from './devicesBl';
import { SyncEvent } from 'ts-events';

export class MinionsBl {
	/**
	 * Minions status update feed.
	 */
	public minionFeed = new SyncEvent<MinionFeed>();
	// Dependencies
	private minionsDal: MinionsDal;
	private devicesBl: DevicesBl;
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
	constructor(minionsDal: MinionsDal, devicesBl: DevicesBl, modulesManager: ModulesManager) {
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
	 * Notify minion status changed by ifttt
	 * @param minionId Minion id.
	 * @param iftttOnChanged Minion key amd status to set.
	 */
	public async notifyMinionChangedByIfttt(minionId: string, iftttOnChanged: IftttOnChanged) {
		const minion = this.findMinion(minionId);

		if (!minion) {
			throw {
				responseCode: 1404,
				message: 'minion not exist',
			} as ErrorResponse;
		}

		/** Make sure the deviceId match to minion deviceId (there is no other authentication!!!) */
		if (iftttOnChanged.deviceId !== minion.device.deviceId) {
			throw {
				responseCode: 5403,
				message: 'invalid device id',
			} as ErrorResponse;
		}

		/** Case it's first time update. */
		if (!minion.minionStatus[minion.minionType]) {
			const initStatus = {
				status: 'on',
			};
			const initMinionStatus = {};
			initMinionStatus[minion.minionType] = initStatus;
			minion.minionStatus = initMinionStatus as MinionStatus;
		}

		/** Update the minion status */
		minion.minionStatus[minion.minionType].status = iftttOnChanged.newStatus;

		/**
		 * Send minions feed update.
		 */
		this.minionFeed.post({
			event: 'update',
			minion,
		});
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
		ModulesManagerSingltone.retrieveMinions.setPullMethod(
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
	 * Read minoin current status.
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
	 * @param minionId minioin id.
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

export const MinionsBlSingleton = new MinionsBl(MinionsDalSingleton, DevicesBlSingleton, ModulesManagerSingltone);
