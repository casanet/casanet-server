import * as moment from 'moment';
import { Moment } from 'moment';
import * as randomstring from 'randomstring';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import * as suncalc from 'suncalc';
import { Configuration } from '../config';
import { TimingsDal, TimingsDalSingleton } from '../data-layer/timingsDal';
import {
	DailySunTrigger,
	DailyTimeTrigger,
	DailyTiming,
	DaysOptions,
	ErrorResponse,
	OnceTiming,
	OperationResult,
	TimeoutTiming,
	Timing,
	TimingFeed,
} from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { OperationsBl, OperationsBlSingleton } from './operationsBl';

const TIMING_INTERVAL_ACTIVATION = moment.duration(5, 'seconds');

export class TimingsBl {
	/**
	 * Timing trigger feed.
	 */
	public timingFeed = new BehaviorSubject<TimingFeed>(undefined);

	/**
	 * The real activation is in minute.
	 * So only if minute changed trigger the timing logic.
	 */
	private lastActivationMoment: Moment = moment(1);

	/**
	 * Init TimingsBl . using dependency injection pattern to allow units testings.
	 * @param timingsDal Inject timings dal.
	 * @param localNetworkReader Inject the reader function.
	 */
	constructor(private timingsDal: TimingsDal, private operationBl: OperationsBl) {

	}

	/**
	 * API
	 */

	public async initTimingModule() {
		setInterval(async () => {
			await this.timingActivation();
		}, TIMING_INTERVAL_ACTIVATION.asMilliseconds());
	}

	/**
	 * Get all timings array.
	 */
	public async getTimings(): Promise<Timing[]> {
		return await this.timingsDal.getTimings();
	}

	/**
	 * Get timing by id.
	 * @param timingId timing id.
	 */
	public async getTimingById(timingId: string): Promise<Timing> {
		return await this.timingsDal.getTimingById(timingId);
	}

	/**
	 * Set timing properties.
	 * @param timingId timing id.
	 * @param timing timing props to set.
	 */
	public async SetTiming(timingId: string, timing: Timing): Promise<void> {
		await this.validateNewTimingOperation(timing);
		timing.timingId = timingId;
		return await this.timingsDal.updateTiming(timing);
	}

	/**
	 * Create timing.
	 * @param timing timing to create.
	 */
	public async CreateTiming(timing: Timing): Promise<void> {
		await this.validateNewTimingOperation(timing);
		/**
		 * Generate new id. (never trust client....)
		 */
		timing.timingId = randomstring.generate(6);
		return await this.timingsDal.createTiming(timing);
	}

	/**
	 * Delete timing.
	 * @param timingId timing id to delete.
	 */
	public async DeleteTiming(timingId: string): Promise<void> {
		return await this.timingsDal.deleteTiming(timingId);
	}

	/**
	 * Active timing.
	 * @param timing timing to active.
	 */
	private async activeTiming(timing: Timing): Promise<void> {
		logger.info(`[activeTiming] Invoke ${timing.timingName} id: ${timing.timingId} timing starting...`);

		const { overrideLock, lockStatus, shabbatMode } = timing;
		try {
			let results: OperationResult[];
			if (timing.triggerDirectAction) {
				logger.info(`[activeTiming] Invoking id: ${timing.timingId} as trigger by direct action for minion "${timing.triggerDirectAction.minionId}" ...`);
				results = await this.operationBl.triggerOperationActivities([timing.triggerDirectAction], { overrideLock, lockStatus, shabbatMode });
			} else {
				logger.info(`[activeTiming] Invoking id: ${timing.timingId} as trigger by operation id ...`);
				results = await this.operationBl.triggerOperationById(timing.triggerOperationId, { overrideLock, lockStatus, shabbatMode });
			}
			logger.info(`[activeTiming] Invoke ${timing.timingName} id: ${timing.timingId} timing done`);

			this.timingFeed.next({
				timing,
				results,
			});
		} catch (error) {
			logger.error(
				`Invoke timing ${timing.timingName}` +
				` id: ${timing.timingId}` +
				` operationId: ${timing.triggerOperationId} fail, ${error.message}`,
			);
		}
	}

	/**
	 * Handle One timing.
	 * Check if time to trigger, and if so, trigger it.
	 * @param now now.
	 * @param timing timing to check.
	 * @param timingProperties Once timing properties.
	 */
	private async onceTiming(now: Moment, timing: Timing, timingProperties: OnceTiming): Promise<void> {
		const timingMoment = moment(timingProperties.date);
		if (now.isSame(timingMoment, 'minute')) {
			await this.activeTiming(timing);
		}
	}

	/**
	 * Check if day exist in timing days.
	 * @param now now.
	 * @param dailyProperties daily timing properties to get days array from.
	 */
	private isInWeek(now: Moment, dailyProperties: DailyTiming) {
		return dailyProperties.days.indexOf(now.format('dddd').toLowerCase() as DaysOptions) !== -1;
	}

	/**
	 * Handle Sun trigger timing.
	 * Check if its time to trigger, and if so, trigger it.
	 * @param now now.
	 * @param timing timing to check.
	 * @param timingProperties SunTrigger timing properties.
	 */
	private async dailySunTiming(now: Moment, timing: Timing, timingProperties: DailySunTrigger): Promise<void> {
		/**
		 * Only id today marked in timing props.
		 */
		if (!this.isInWeek(now, timingProperties)) {
			return;
		}

		/**
		 * Get sun info.
		 */
		const sunTimes = suncalc.getTimes(
			new Date(),
			Configuration.homePosition.latitude,
			Configuration.homePosition.longitude,
		);

		/**
		 * Get sun trigger moment.
		 */
		let sunTriggerMoment: Moment;
		if (timingProperties.sunTrigger === 'sunrise') {
			sunTriggerMoment = moment(sunTimes.sunrise);
		} else {
			sunTriggerMoment = moment(sunTimes.sunset);
		}

		/**
		 * Add / sub minuts of duration from sun trigger.
		 */
		sunTriggerMoment.add(timingProperties.durationMinutes, 'minutes');

		/**
		 * If its new trigger timing.
		 */
		if (now.isSame(sunTriggerMoment, 'minute')) {
			await this.activeTiming(timing);
		}
	}

	/**
	 * Handle Day time trigger timing.
	 * Check if its time to trigger, and if so, trigger it.
	 * @param now now.
	 * @param timing timing to check.
	 * @param timingProperties TimeTrigger timing properties.
	 */
	private async dailyTimeTiming(now: Moment, timing: Timing, timingProperties: DailyTimeTrigger): Promise<void> {
		/**
		 * Only id today marked in timing props.
		 */
		if (!this.isInWeek(now, timingProperties)) {
			return;
		}

		const momentInday = moment();
		momentInday.set('hour', timingProperties.hour);
		momentInday.set('minute', timingProperties.minutes);

		/**
		 * If its new trigger timing.
		 */
		if (now.isSame(momentInday, 'minute')) {
			await this.activeTiming(timing);
		}
	}

	/**
	 * Handle timeout trigger timing.
	 * Check if its time to trigger, and if so, trigger it.
	 * @param now now.
	 * @param timing timing to check.
	 * @param timingProperties TimeoutTiming timing properties.
	 */
	private async timeoutTiming(now: Moment, timing: Timing, timingProperties: TimeoutTiming): Promise<void> {
		const timeoutMoment = moment(timingProperties.startDate);
		timeoutMoment.add(timingProperties.durationInMinutes, 'minute');

		/**
		 * If its new trigger timing.
		 */
		if (now.isSame(timeoutMoment, 'minute')) {
			await this.activeTiming(timing);
		}
	}

	private async timingActivation(): Promise<void> {
		const now = moment();

		/**
		 * Only if minute changed.
		 */
		if (this.lastActivationMoment.isSameOrAfter(now, 'minute')) {
			return;
		}

		this.lastActivationMoment = now;

		const timings = await this.timingsDal.getTimings();

		for (const timing of timings) {
			if (!timing.isActive) {
				continue;
			}

			switch (timing.timingType) {
				case 'once': {
					await this.onceTiming(now, timing, timing.timingProperties[timing.timingType]);
					break;
				}
				case 'dailySunTrigger': {
					await this.dailySunTiming(now, timing, timing.timingProperties[timing.timingType]);
					break;
				}
				case 'dailyTimeTrigger': {
					await this.dailyTimeTiming(now, timing, timing.timingProperties[timing.timingType]);
					break;
				}
				case 'timeout': {
					await this.timeoutTiming(now, timing, timing.timingProperties[timing.timingType]);
					break;
				}
			}
		}
	}

	/**
	 * Validate timing.
	 * 1) operation existence.
	 * 2) correct timing properties.
	 * @param timing timing to validate existence.
	 */
	private async validateNewTimingOperation(timing: Timing): Promise<ErrorResponse> {
		await this.operationBl.getOperationById(timing.triggerOperationId);

		if (!timing.timingProperties[timing.timingType]) {
			throw {
				responseCode: 3405,
				message: 'timing properties not match to timing type',
			} as ErrorResponse;
		}
		return;
	}
}

export const TimingsBlSingleton = new TimingsBl(TimingsDalSingleton, OperationsBlSingleton);
