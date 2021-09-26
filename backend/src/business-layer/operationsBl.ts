import * as moment from 'moment';
import * as randomstring from 'randomstring';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { Configuration } from '../config';
import { OperationsDal, OperationsDalSingleton } from '../data-layer/operationsDal';
import { SetLockOptions } from '../models/backendInterfaces';
import { ErrorResponse, MinionStatus, Operation, OperationActivity, OperationResult, Minion } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { Delay } from '../utilities/sleep';
import { MinionsBl, MinionsBlSingleton } from './minionsBl';

export class OperationsBl {
	/**
	 * Init OperationsBl . using dependency injection pattern to allow units testings.
	 * @param operationsDal Inject operations dal.
	 * @param localNetworkReader Inject the reader function.
	 */
	constructor(private operationsDal: OperationsDal, private minionsBl: MinionsBl) { }

	/**
	 * API
	 */

	/**
	 * Get all operations array.
	 */
	public async getOperations(): Promise<Operation[]> {
		return await this.operationsDal.getOperations();
	}

	/**
	 * Get operation by id.
	 * @param operationId operation id.
	 */
	public async getOperationById(operationId: string): Promise<Operation> {
		return await this.operationsDal.getOperationById(operationId);
	}

	/**
	 * Set operation properties.
	 * @param operationId operation id.
	 * @param operation operation props to set.
	 */
	public async SetOperation(operationId: string, operation: Operation): Promise<void> {
		await this.validateNewOperationActivities(operation.activities);
		operation.operationId = operationId;
		return await this.operationsDal.updateOperation(operation);
	}

	/**
	 * Create operation.
	 * @param operation operation to create.
	 */
	public async CreateOperation(operation: Operation): Promise<void> {
		await this.validateNewOperationActivities(operation.activities);
		/**
		 * Generate new id. (never trust client....)
		 */
		operation.operationId = randomstring.generate(6);
		return await this.operationsDal.createOperation(operation);
	}

	/**
	 * Delete operation.
	 * @param operationId operation id to delete.
	 */
	public async DeleteOperation(operationId: string): Promise<void> {
		return await this.operationsDal.deleteOperation(operationId);
	}

	/**
	 * Validate activities. (minion and status to set).
 	 * @param operationActivities activities array to validate.
 	 */
	private async validateNewOperationActivities(operationActivities: OperationActivity[]): Promise<ErrorResponse> {
		for (const activity of operationActivities) {
			const activityMinion = await this.minionsBl.getMinionById(activity.minionId);

			if (!activity.minionStatus[activityMinion.minionType]) {
				throw {
					responseCode: 2405,
					message: 'incorrect minion status for activity minion type',
				} as ErrorResponse;
			}
		}

		return;
	}

	/**
	 * Trigger operation activities
	 * @param operationId operation to trigger.
	 * @returns Set status erros if will be any.
	 */
	public async triggerOperationById(operationId: string, options: SetLockOptions = {}): Promise<OperationResult[]> {
		const operation = await this.operationsDal.getOperationById(operationId);
		logger.info(`Invoking operation ${operation.operationName}, id: ${operationId} ...`);
		const errors = await this.triggerOperationActivities(operation.activities, options);
		logger.info(`Invoking operation ${operation.operationName}, id: ${operationId} done`);
		return errors;
	}



	/**
	 * Invoke each activity.
	 * @param operationActivities activities to invoke.
	 */
	public async triggerOperationActivities(
		operationActivities: OperationActivity[],
		options: SetLockOptions,
	): Promise<OperationResult[]> {
		const errors: OperationResult[] = [];
		for (const activity of operationActivities) {
			/**
			 * wait 1 sec between one minion to other, because of broadcasting mismatch in some brands communication protocol.
			 */
			await Delay(moment.duration(1, 'seconds'));

			logger.info(`Setting minion ${activity.minionId} a new status by operation activity...`);

			let minion: Minion;
			try {
				minion = await this.minionsBl.getMinionById(activity.minionId);
			} catch (error) {
				logger.info(`Getting minion ${activity.minionId} failed, ignoring this minion activity`);
				continue;
			}

			// If need to override, just remove any lock
			if (options.overrideLock) {
				try {
					await this.minionsBl.setMinionCalibrate(activity.minionId, {
						calibrationCycleMinutes: 0,
						calibrationMode: minion.calibration ? minion.calibration.calibrationMode : 'AUTO',
					});
				} catch (error) {
					logger.error(`[operation] Fail to override minion "${activity.minionId}" lock`);
				}
			}

			// If need to set 'Sabbat' lock, set it.
			if (options.shabbatMode) {
				try {
					await this.minionsBl.setMinionCalibrate(activity.minionId, {
						calibrationCycleMinutes: Configuration.defaultLockCalibrationMinutes,
						calibrationMode: 'SHABBAT',
					});
				} catch (error) {
					logger.error(`[operation] Fail to set minion "${activity.minionId}" operation activity lock`);
				}
				// Else if need to set a 'lock', select the correct lock depend on the 'set status' value
			} else if (options.lockStatus) {
				try {
					await this.minionsBl.setMinionCalibrate(activity.minionId, {
						calibrationCycleMinutes: Configuration.defaultLockCalibrationMinutes,
						calibrationMode: activity.minionStatus[minion.minionType].status === 'on'
							? 'LOCK_ON'
							: 'LOCK_OFF',
					});
				} catch (error) {
					logger.error(`[operation] Fail to set minion "${activity.minionId}" operation activity lock`);
				}
			}

			try {
				await this.minionsBl.setMinionStatus(activity.minionId, activity.minionStatus);
				continue;
			} catch (error) {
				logger.warn(
					`Setting minion ${activity.minionId} a new status by operation activity data: ` +
					`${JSON.stringify(activity.minionStatus)} fail, ` +
					`${JSON.stringify(error)}`,
				);
			}

			await Delay(moment.duration(3, 'seconds'));

			logger.info(`Trying set status for  ${activity.minionId} agine...`);

			try {
				await this.minionsBl.setMinionStatus(activity.minionId, activity.minionStatus);
				continue;
			} catch (error) {
				logger.warn(`The second try to set status for ${activity.minionId} fail too`);
			}

			await Delay(moment.duration(5, 'seconds'));

			logger.info(`Last chance of set status for  ${activity.minionId} ...`);

			try {
				await this.minionsBl.setMinionStatus(activity.minionId, activity.minionStatus);
			} catch (error) {
				logger.warn(`Last chance to set status for ${activity.minionId} fail too. sorry ;)`);
				errors.push({
					minionId: activity.minionId,
					error,
				});
			}
		}
		return errors;
	}
}

export const OperationsBlSingleton = new OperationsBl(OperationsDalSingleton, MinionsBlSingleton);
