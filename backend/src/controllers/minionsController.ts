import {
	Body,
	Controller,
	Delete,
	Get,
	Header,
	Path,
	Post,
	Put,
	Query,
	Response,
	Request,
	Route,
	Security,
	SuccessResponse,
	Tags,
	Deprecated,
} from 'tsoa';
import { MinionsBlSingleton } from '../business-layer/minionsBl';
import { TimelineBlSingleton } from '../business-layer/timelineBl';
import {
	ErrorResponse,
	IftttOnChanged,
	Minion,
	MinionCalibrate,
	MinionRename,
	MinionSetRoomName,
	MinionStatus,
	MinionTimeline,
	ScanningStatus,
	SetMinionAutoTurnOff,
	VersionUpdateStatus,
} from '../models/sharedInterfaces';
import { DeepCopy } from '../utilities/deepCopy';

@Tags('Minions')
@Route('minions')
export class MinionsController extends Controller {
	/**
	 * Get the timeline of minions status.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Get('timeline')
	public async getMinionsTimeline(): Promise<MinionTimeline[]> {
		return await TimelineBlSingleton.getTimeline();
	}

	/**
 	 * Get the timeline of minions status.
 	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Get('timeline/{minionId}')
	public async getMinionTimeline(minionId: string): Promise<MinionTimeline[]> {
		return await TimelineBlSingleton.getTimeline(minionId);
	}

	/**
	 * Power off all minions
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Put('power-off')
	public async powerAllOff(@Request() request): Promise<void> {
		return await MinionsBlSingleton.powerAllOff(request.user);
	}

	/**
	 * Update minion name.
	 * @param minionId Minion id.
	 * @param name Minion new name to set.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Put('rename/{minionId}')
	public async renameMinion(minionId: string, @Body() minionRename: MinionRename): Promise<void> {
		return await MinionsBlSingleton.renameMinion(minionId, minionRename.name);
	}

	/**
	 * Update minion room name.
	 * @param minionId Minion id.
	 * @param roomName Minion room name to set.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Put('room/{minionId}')
	public async renameRoom(minionId: string, @Body() roomName: MinionSetRoomName): Promise<void> {
		return await MinionsBlSingleton.setMinionRoom(minionId, roomName.room);
	}

	/**
	 * Update minion auto turns off timeout.
	 * @param minionId Minion id.
	 * @param setTimeout Timeout property.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Put('timeout/{minionId}')
	public async setMinionTimeout(minionId: string, @Body() setTimeout: SetMinionAutoTurnOff): Promise<void> {
		return await MinionsBlSingleton.setMinionTimeout(minionId, setTimeout.setAutoTurnOffMS);
	}

	/**
	 * Update minion auto turns off timeout.
	 * @param minionId Minion id.
	 * @param MinionCalibrate Timeout property.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Put('calibrate/{minionId}')
	public async setMinionCalibrate(minionId: string, @Body() calibration: MinionCalibrate): Promise<void> {
		return await MinionsBlSingleton.setMinionCalibrate(minionId, calibration);
	}

	/**
	 * Recheck minion device status (update server status cache).
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Post('rescan/{minionId}')
	public async rescanMinionStatus(minionId: string): Promise<void> {
		return await MinionsBlSingleton.scanMinionStatus(minionId);
	}

	/**
	 * Recheck every minion device status (update server status cache).
	 * Note that this is not the devices scan!
	 * This scanning only checks every minion API to know the current status.
	 * @param scanNetwork Whenever scan also the local networks IP's map or not
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Post('rescan')
	public async rescanMinionsStatus(@Query() scanNetwork: boolean = false): Promise<void> {
		return await MinionsBlSingleton.scanMinionsStatus(scanNetwork);
	}

	/**
	 * Get the current scanning status
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Get('rescan')
	public async getSescaningMinionsStatus(): Promise<ScanningStatus> {
		return {
			scanningStatus: await MinionsBlSingleton.getScaningStatus(),
		};
	}

	/**
	 * Delete minion from the system.
	 * @param minionId Minion id.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Delete('{minionId}')
	public async deleteMinion(minionId: string): Promise<void> {
		return await MinionsBlSingleton.deleteMinion(minionId);
	}

	/**
	 *  Creates a new minion.
	 * @param minion The new minion to create.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Post()
	public async createMinion(@Body() minion: Minion): Promise<void> {
		return await MinionsBlSingleton.createMinion(minion);
	}

	/**
	 * Notify minion status changed by ifttt webhook (https://ifttt.com/maker_webhooks).
	 * @param minionId Minion id.
	 * @param iftttOnChanged Minion key amd status to set.
	 */
	@Response<ErrorResponse>(501, 'Server error')
	@Security('iftttAuth')
	@Deprecated()
	@Put('{minionId}/ifttt')
	public async notifyMinionStatusChanged(minionId: string, @Body() iftttOnChanged: IftttOnChanged): Promise<void> {
		return await MinionsBlSingleton.notifyMinionChangedByIfttt(minionId, iftttOnChanged);
	}

	/**
	 * Get all minions in the system.
	 * @returns Minions array.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Get()
	public async getMinions(): Promise<Minion[]> {
		return this.cleanUpMinionsBeforeRelease(await MinionsBlSingleton.getMinions());
	}

	/**
	 * Get minion by id.
	 * @returns Minion.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Get('{minionId}')
	public async getMinion(minionId: string): Promise<Minion> {
		return this.cleanUpMinionBeforeRelease(await MinionsBlSingleton.getMinionById(minionId));
	}

	/**
	 * Update minion status.
	 * @param minionId Minion id.
	 * @param setStatus Minion status to set.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Put('{minionId}')
	public async setMinion(@Request() request, minionId: string, @Body() setStatus: MinionStatus): Promise<void> {
		return await MinionsBlSingleton.setMinionStatus(minionId, setStatus, 'user', request.user);
	}
	/**
	 * NEVER let anyone get device API keys.
	 * @param minion minion to remove keys from.
	 */
	private cleanUpMinionBeforeRelease(minion: Minion): Minion {
		const minionCopy = DeepCopy<Minion>(minion);
		delete minionCopy.device.deviceId;
		delete minionCopy.device.token;
		return minionCopy;
	}

	/**
	 * NEVER let anyone get device API keys.
	 * @param minions minions to remove keys from.
	 */
	private cleanUpMinionsBeforeRelease(minions: Minion[]): Minion[] {
		const minionsCopy: Minion[] = [];
		for (const minion of minions) {
			minionsCopy.push(this.cleanUpMinionBeforeRelease(minion));
		}
		return minionsCopy;
	}
}
