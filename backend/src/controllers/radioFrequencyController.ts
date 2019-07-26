import { Body, Controller, Delete, Get, Header, Path, Post, Put, Query, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { RfBlSingleton } from '../business-layer/rfBl';
import {
    CommandsRepoDevice,
    ErrorResponse,
    MinionStatus,
} from '../models/sharedInterfaces';

@Tags('RF')
@Route('rf')
export class RfController extends Controller {

    /**
     * Get all aupported devices in commands repo see https://github.com/haimkastner/rf-commands-repo API.
     * @returns supported devices collection.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('devices')
    public async getCommandsRepoAvailableDevices(): Promise<CommandsRepoDevice[]> {
        return await RfBlSingleton.getAvailableDevicesToFetch();
    }

    /**
     * Fetch commands set for certain minion see https://github.com/haimkastner/rf-commands-repo API.
     * @param minionId minion to fetch commands for.
     * @param commandsRepoDevice devices commands set to fetch.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('fetch-commands/{minionId}')
    public async fetchDeviceCommandsToMinion(minionId: string, @Body() commandsRepoDevice: CommandsRepoDevice): Promise<void> {
        return await RfBlSingleton.fetchDeviceCommandsToMinion(minionId, commandsRepoDevice);
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
    @Post('record/{minionId}')
    public async recordMinionCommand(minionId: string, @Body() minionStatus: MinionStatus): Promise<void> {
        return RfBlSingleton.recordCommand(minionId, minionStatus);
    }

    /**
     * Generate a command (IR, 433-RF or any other supported RF tech)
     * for current minion status.
     * @param minionId Minon id.
     * @param minionStatus Minion object status to generate command for.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('generate/{minionId}')
    public async generateMinionCommand(minionId: string, @Body() minionStatus: MinionStatus): Promise<void> {
        return RfBlSingleton.generateCommand(minionId, minionStatus);
    }
}
