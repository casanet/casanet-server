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
import { TimeoutBlSingleton } from '../business-layer/timeoutBl';
import {
	ErrorResponse,
	MinionCalibrate,
	MinionRename,
	MinionSetDevice,
	MinionSetRoomName,
	MinionStatus,
	MinionTimeline,
	MinionTimeout,
	RestrictionItem,
	ScanningStatus,
	SetMinionAutoTurnOff,
	User,
	VersionUpdateStatus,
} from '../models/sharedInterfaces';
import { MinionsResultsRestriction, MinionsRestriction, MinionSanitation, Minion } from '../security/restrictions';
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
	@MinionsRestriction({ requirePermission: 'READ', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
	@Get('timeline/{minionId}')
	public async getMinionTimeline(minionId: string): Promise<MinionTimeline[]> {
		return await TimelineBlSingleton.getTimeline(minionId);
	}

	/**
	 * Update minion auto turns off timeout.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@MinionsResultsRestriction((m: MinionTimeout) => m.minionId)
	@Get('timeout')
	public async getMinionsTimeout(): Promise<MinionTimeout[]> {
		return await TimeoutBlSingleton.getTimeoutStatus();
	}

	/**
	 * URestart minion timeout countdown.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
	@Post('timeout/restart/{minionId}')
	public async restartMinionTimeout(minionId: string): Promise<void> {
		return await TimeoutBlSingleton.restartMinionTimeout(minionId);
	}

	/**
	 * Update minion auto turns off timeout.
	 * @param minionId Minion id.
	 * @param setTimeout Timeout property.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
	@Put('timeout/{minionId}')
	public async setMinionTimeout(minionId: string, @Body() setTimeout: SetMinionAutoTurnOff): Promise<void> {
		return await MinionsBlSingleton.setMinionTimeout(minionId, setTimeout.setAutoTurnOffMS);
	}


	/**
	 * Power off all minions
	 */
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Put('power-off')
	public async powerAllOff(@Request() request): Promise<void> {
		return await MinionsBlSingleton.powerAllOff(request.user);
	}

	/**
	 * Update minion name.
	 * @param minionId Minion id.
	 * @param minionRename The new name to set.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
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
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
	@Put('room/{minionId}')
	public async renameRoom(minionId: string, @Body() roomName: MinionSetRoomName): Promise<void> {
		return await MinionsBlSingleton.setMinionRoom(minionId, roomName.room);
	}

	/**
	 * Replace physical device of given minion.
	 * @param minionId Minion id.
	 * @param macToSet Device mac address to replace to.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
	@Put('network-device/{minionId}')
	public async replaceNetworkDevice(minionId: string, @Body() macToSet: MinionSetDevice): Promise<void> {
		return await MinionsBlSingleton.replaceNetworkDevice(minionId, macToSet.mac);
	}




	/**
	 * Update minion auto turns off timeout.
	 * @param minionId Minion id.
	 * @param MinionCalibrate Timeout property.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
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
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
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
			scanningStatus: await MinionsBlSingleton.getScanningStatus(),
		};
	}

	/**
	 * Set minion access restrictions
	 * @param minionId Minion id.
	 * @param restrictions The collection of restriction to set.
	 */
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Put('restrictions/{minionId}')
	public async setMinionRestriction(minionId: string, @Body() restrictions: RestrictionItem[]): Promise<void> {
		return await MinionsBlSingleton.setMinionRestrictions(minionId, restrictions);
	}

	/**
	 * Delete minion from the system.
	 * @param minionId Minion id.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
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
	 * Get all minions in the system.
	 * @returns Minions array.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@MinionSanitation()
	@MinionsResultsRestriction((m: Minion) => m.minionId)
	@Response<ErrorResponse>(501, 'Server error')
	@Get()
	public async getMinions(): Promise<Minion[]> {
		return await MinionsBlSingleton.getMinions();
	}

	/**
	 * Get minion by id.
	 * @returns Minion.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@MinionSanitation()
	@MinionsRestriction({ requirePermission: 'READ', elementArgIndex: 0, extractMinionIds: (minionId: string) => minionId })
	@Get('{minionId}')
	public async getMinion(minionId: string): Promise<Minion> {
		return await MinionsBlSingleton.getMinionById(minionId)
	}

	/**
	 * Update minion status.
	 * @param minionId Minion id.
	 * @param setStatus Minion status to set.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@MinionsRestriction({ requirePermission: 'WRITE', elementArgIndex: 1, extractMinionIds: (minionId: string) => minionId })
	@Put('{minionId}')
	public async setMinion(@Request() request, minionId: string, @Body() setStatus: MinionStatus): Promise<void> {
		return await MinionsBlSingleton.setMinionStatus(minionId, setStatus, 'user', request.user);
	}
}
