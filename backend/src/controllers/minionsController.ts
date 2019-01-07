import { Body, Controller, Delete, Get, Header, Path, Post, Put, Query, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse, Minion } from '../models/sharedInterfaces';

@Tags('Minions')
@Route('minions')
export class MinionsController extends Controller {

    /**
     * Get all minions in system.
     * @returns Minions array.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getMinions(): Promise<Minion[]> {
        return [];
        // TODO: await new DevicesService().get(id);
    }

    /**
     * Get minion by id.
     * @returns Minion.
     */
    @Security('userAuth')
    @Get('{minionId}')
    public async getMinion(minionId: string): Promise<Minion> {
        return;
        // TODO: await new DevicesService().get(id);
    }

    /**
     * Update minion status.
     * @param minionId Minon id.
     * @param minion Minion object to update to.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{minionId}')
    public async setMinion(minionId: string, @Body() minion: Minion): Promise<void> {
        // TODO ...
        return;
    }

    /**
     * Update minion turn off timout.
     * @param minionId Minon id.
     * @param minion Minion object to update to.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('timeout/{minionId}')
    public async setMinionTimeout(minionId: string, @Body() minion: Minion): Promise<void> {
        // TODO ...
        return;
    }

    /**
     * Record a command (IR, 433-RF or any other supported RF tech)
     * for current minion status.
     * @param minionId Minon id.
     * @param minion Minion object status to get command for.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('command/{minionId}')
    public async recordMinionCommand(minionId: string, @Body() minion: Minion): Promise<void> {
        // TODO ...
        return;
    }

    /**
     * Scan LAN to know to current status of the minion.
     * Note that this is not the devices scan!
     * This scen only checks every minion API to know the current status.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('rescan')
    public async rescanMinionsStatus(): Promise<void> {
        // TODO ...
        return;
    }

    /**
     * Delete minion from system.
     * @param minionId Minon id.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{minionId}')
    public async deleteMinion(minionId: string): Promise<void> {
        // TODO ...
        return;
    }

    /**
     *  Creates new minion.
     * @param minion new minion to create.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createMinion(@Body() minion: Minion): Promise<void> {
        // TODO ...
        return;
    }
}
