import * as request from 'request-promise';
import { Configuration } from '../config';
import { AcCommands, CommandsSet, RollerCommands, ToggleCommands } from '../models/backendInterfaces';
import {
    CommandsRepoDevice,
    ErrorResponse,
    MinionStatus,
} from '../models/sharedInterfaces';
import { ModulesManager, ModulesManagerSingltone } from '../modules/modulesManager';
import { logger } from '../utilities/logger';
import { Delay } from '../utilities/sleep';
import { DevicesBl, DevicesBlSingleton } from './devicesBl';
import { MinionsBl, MinionsBlSingleton } from './minionsBl';

export class RfBl {

    /**
     * Init minions bl. using dependecy injection pattern to allow units testings.
     * @param minionsDal Inject the dal instance.
     */
    constructor(private minionsBl: MinionsBl, private modulesManager: ModulesManager) {

    }

    /**
     * Get all aupported devices in commands repo.
     * @returns supported devices collection.
     */
    public async getAvailableDevicesToFetch(): Promise<CommandsRepoDevice[]> {
        try {
            return await request({
                method: 'GET',
                uri: `${Configuration.commandsRepoUrl}/devices`,
                json: true,
            });
        } catch (error) {
            logger.warn(`Get supported devices from commands repo fail, ${JSON.stringify(!error ? error : error.message)}`);
            throw {
                responseCode: 10501,
                message: 'Get supported devices from commands repo fail',
            } as ErrorResponse;
        }
    }

    /**
     * Fetch commands set for certain minion.
     * @param minionId minion to fetch commands for.
     * @param commandsRepoDevice devices commands set to fetch.
     */
    public async fetchDeviceCommandsToMinion(minionId: string, commandsRepoDevice: CommandsRepoDevice) {
        const minion = await this.minionsBl.getMinionById(minionId);

        try {
            const commands: ToggleCommands | AcCommands | RollerCommands = await request({
                method: 'GET',
                uri: `${Configuration.commandsRepoUrl}/rf/${commandsRepoDevice.brand}/${commandsRepoDevice.model}`,
                json: true,
            });

            const commandsSet: CommandsSet = {
                deviceType: minion.minionType,
                commands: {

                },
            };
            commandsSet.commands[minion.minionType] = commands;
            await this.modulesManager.setFetchedCommands(minion, commandsSet);
        } catch (error) {
            // tslint:disable-next-line:max-line-length
            logger.warn(`Fetch rf commands for ${commandsRepoDevice.brand}/${commandsRepoDevice.model} fail, ${JSON.stringify(!error ? error : error.message)}`);
            throw {
                responseCode: 11501,
                message: 'Fetch rf commands commands repo fail',
            } as ErrorResponse;
        }
    }

    /**
     * Record command for current minion status.
     * @param minionId minion to record for.
     * @param statusToRecordFor The status to record command for.
     */
    public async recordCommand(minionId: string, statusToRecordFor: MinionStatus): Promise<void> {
        const minion = await this.minionsBl.getMinionById(minionId);

        /**
         * The minion status is depend on minion type.
         */
        if (!statusToRecordFor[minion.minionType]) {
            throw {
                responseCode: 1405,
                message: 'incorrect minion status for current minion type',
            } as ErrorResponse;
        }

        await this.modulesManager.enterRecordMode(minion, statusToRecordFor);
    }

    /**
     * Record command for current minion status.
     * @param minionId minion to record for.
     * @param statusToGenerateFor The status to record command for.
     */
    public async generateCommand(minionId: string, statusToGenerateFor: MinionStatus): Promise<void> {
        const minion = await this.minionsBl.getMinionById(minionId);

        /**
         * The minion status is depend on minion type.
         */
        if (!statusToGenerateFor[minion.minionType]) {
            throw {
                responseCode: 1405,
                message: 'incorrect minion status for current minion type',
            } as ErrorResponse;
        }

        await this.modulesManager.generateCommand(minion, statusToGenerateFor);
    }
}

export const RfBlSingleton = new RfBl(MinionsBlSingleton, ModulesManagerSingltone);
