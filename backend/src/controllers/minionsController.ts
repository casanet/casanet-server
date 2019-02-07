import { Body, Controller, Delete, Get, Header, Path, Post, Put, Query, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { MinionsBlSingleton } from '../business-layer/minionsBl';
import { ErrorResponse, LocalNetworkDevice, Minion, MinionStatus, SetMinionAutoTurnOff, Timing } from '../models/sharedInterfaces';

@Tags('Minions')
@Route('minions')
export class MinionsController extends Controller {

    /**
     * Get all minions in system.
     * @returns Minions array.
     */
    @Security('userAuth')
    @Security('adminAuth')
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
    @Get('{minionId}')
    public async getMinion(minionId: string): Promise<Minion> {
        return await MinionsBlSingleton.getMinionById(minionId);
    }

    /**
     * Update minion status.
     * @param minionId Minon id.
     * @param setStatus Minion status to set.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{minionId}')
    public async setMinion(minionId: string, @Body() setStatus: MinionStatus): Promise<void> {
        return await MinionsBlSingleton.setMinionStatus(minionId, setStatus);
    }

    /**
     * Update minion turn off timout.
     * @param minionId Minon id.
     * @param minion Minion object to update to.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('timeout/{minionId}')
    public async setMinionTimeout(minionId: string, @Body() setTimeout: SetMinionAutoTurnOff): Promise<void> {
        return await MinionsBlSingleton.setMinionTimeout(minionId, setTimeout.setAutoTurnOffMS );
    }

    /**
     * Record a command (IR, 433-RF or any other supported RF tech)
     * for current minion status.
     * @param minionId Minon id.
     * @param minionStatus Minion object status to get command for.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('command/{minionId}')
    public async recordMinionCommand(minionId: string, @Body() minionStatus: MinionStatus): Promise<void> {
        return MinionsBlSingleton.recordCommand(minionId, minionStatus);
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
     * This scen only checks every minion API to know the current status.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('rescan')
    public async rescanMinionsStatus(): Promise<void> {
        return await MinionsBlSingleton.scanMinionsStatus();
    }

    /**
     * Delete minion from system.
     * @param minionId Minon id.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{minionId}')
    public async deleteMinion(minionId: string): Promise<void> {
        return await MinionsBlSingleton.deleteMinion(minionId);
    }

    /**
     *  Creates new minion.
     * @param minion new minion to create.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createMinion(@Body() minion: Minion): Promise<void> {
        return await MinionsBlSingleton.createMinion(minion);
    }
}
