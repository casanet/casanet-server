import * as moment from 'moment';
import * as randomstring from 'randomstring';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { MinionsDal, MinionsDalSingleton } from '../data-layer/minionsDal';
import { DeviceKind, ErrorResponse, LocalNetworkDevice, Minion, MinionDevice, MinionFeed, MinionStatus } from '../models/sharedInterfaces';
import { ModulesManager, ModulesManagerSingltone } from '../modules/modulesManager';
import { logger } from '../utilities/logger';
import { Delay } from '../utilities/sleep';
import { DevicesBl, DevicesBlSingleton } from './devicesBl';

export class MinionsBl {

    // Dependecies
    private minionsDal: MinionsDal;
    private devicesBl: DevicesBl;
    private modulesManager: ModulesManager;

    /**
     * minions
     */
    private minions: Minion[] = [];

    /**
     * Minions status update feed.
     */
    public minionFeed = new BehaviorSubject<MinionFeed>(undefined);

    /**
     * Init minions bl. using dependecy injection pattern to allow units testings.
     * @param minionsDal Inject the dal instance.
     */
    constructor(minionsDal: MinionsDal, devicesBl: DevicesBl, modulesManager: ModulesManager) {

        this.minionsDal = minionsDal;
        this.devicesBl = devicesBl;
        this.modulesManager = modulesManager;

        logger.info('Starting init minions....');
        this.initData()
            .then(() => {
                logger.info('Init minions done');
            })
            .catch(() => {
                logger.error('Init minions fail.');
            });
    }

    /**
     * Init minions.
     */
    private async initData(): Promise<void> {

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
         * Then load minion with new pysical network data
         */
        await this.loadMinionsLocalDeviceData(localDevices);

        /**
         * Finally get all minions status.
         */
        await this.readMinionsStatus();

        /**
         * Let`s modules retrieve updated minions array.
         */
        ModulesManagerSingltone.retrieveMinions.setPullMethod(async (): Promise<Minion[]> => {
            return await this.getMinions();
        });

        /**
         * After all registar to devices status updates.
         */
        this.modulesManager.minionStatusChangedEvent.subscribe(async (pysicalDeviceUpdate) => {
            if (!pysicalDeviceUpdate) {
                return;
            }

            try {
                const minion = await this.getMinionById(pysicalDeviceUpdate.minionId);
                minion.isProperlyCommunicated = true;
                minion.minionStatus = pysicalDeviceUpdate.status;
                this.minionFeed.next({
                    event: 'update',
                    minion,
                });
            } catch (error) {
                logger.info(`Avoiding device update, there is no minion with id: ${pysicalDeviceUpdate.minionId}`);
                return;
            }
        });

        /**
         * And also Registar to devices pysical data update (name or ip).
         */
        this.devicesBl.devicesUpdate.subscribe((localsDevices: LocalNetworkDevice[]) => {
            this.loadMinionsLocalDeviceData(localsDevices);
        });
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
    private async readMinionStatus(minion: Minion): Promise<ErrorResponse> {
        const currentStatus: MinionStatus = await this.modulesManager.getStatus(minion)
            .catch((err: ErrorResponse) => {
                minion.isProperlyCommunicated = false;
                logger.warn(`Fail to read status of ${minion.name} id: ${minion.minionId} err : ${err.message}`);
                throw err;
            }) as MinionStatus;
        minion.isProperlyCommunicated = true;
        minion.minionStatus = currentStatus;
        this.minionFeed.next({
            event: 'update',
            minion,
        });
        return;
    }

    /**
     * Read each minion current status.
     */
    private async readMinionsStatus(): Promise<void> {
        for (const minion of this.minions) {

            /**
             * Read current minion status.
             */
            await this.readMinionStatus(minion)
                .catch(() => {
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
            if (kind.brand === minionToCheck.device.brand &&
                kind.model === minionToCheck.device.model) {
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
        if (deviceKind.isTokenRequierd && !minionToCheck.device.token) {
            return {
                responseCode: 2409,
                message: 'token is requird',
            };
        }

        /**
         * Check if id reqired and not exist.
         */
        if (deviceKind.isIdRequierd && !minionToCheck.device.deviceId) {
            return {
                responseCode: 3409,
                message: 'id is requird',
            };
        }

        /**
         * If the modele is not for unlimited minoins count the used minions.
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
        minionToCheck.minionType = deviceKind.suppotedMinionType;
    }

    /**
     * API
     */

    /**
     * Gets minons array.
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
     * mean update minions cache by request each device what is the real status.
     */
    public async scanMinionsStatus(): Promise<void> {
        await this.modulesManager.refreshModules();
        await this.readMinionsStatus();
    }

    /**
     * Scan minion real status.
     * mean update minions cache by request the device what is the real status.
     */
    public async scanMinionStatus(minionId: string): Promise<void> {
        const minioin = this.findMinion(minionId);
        if (!minioin) {
            throw {
                responseCode: 1404,
                message: 'minion not exist',
            } as ErrorResponse;
        }
        await this.readMinionStatus(minioin);
    }

    /**
     * Set minon status
     * @param minionId minion to set new status to.
     * @param minionStatus the status to set.
     */
    public async setMinionStatus(minionId: string, minionStatus: MinionStatus): Promise<void> {
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

        /**
         * set the status.
         */
        await this.modulesManager.setStatus(minion, minionStatus)
            .catch((err) => {
                minion.isProperlyCommunicated = false;
                throw err;
            });

        minion.isProperlyCommunicated = true;

        /**
         * If success, update minion to new status.
         */
        minion.minionStatus = minionStatus;

        /**
         * Send minions feed update.
         */
        this.minionFeed.next({
            event: 'update',
            minion,
        });
    }

    /**
     * Set minoin timeout property.
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
        this.minionsDal.updateMinionAutoTurnOff(minionId, setAutoTurnOffMS)
            .catch((error: ErrorResponse) => {
                logger.warn(`Fail to update minion ${minionId} auto turn off ${error.message}`);
            });

        /**
         * Send minion feed update
         */
        this.minionFeed.next({
            event: 'update',
            minion,
        });
    }

    /**
     * Create new minon
     * @param minion minon to create.
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
         * get local devices (to load corrent pysical info such as ip)
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
        minion.minionId = randomstring.generate(5);

        /**
         * Create new minion in dal.
         */
        await this.minionsDal.createMinion(minion);

        /**
         * Send create new minion feed update (*befor* try to get the status!!!)
         */
        this.minionFeed.next({
            event: 'created',
            minion,
        });

        /**
         * Try to get current status.
         */
        try {
            await this.readMinionStatus(minion);
        } catch (error) {

        }
    }

    /**
     * Delete minoin
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

        // The minoins arrat is given from DAL by ref, mean if removed
        // from dal it will removed from BL too, so check if exist
        // (if in next someone will copy by val) and then remove.
        if (this.minions.indexOf(originalMinion) !== -1) {
            this.minions.splice(this.minions.indexOf(originalMinion), 1);
        }

        this.minionFeed.next({
            event: 'removed',
            minion: originalMinion,
        });

        // Finally clean module communication
        await this.modulesManager.refreshModule(originalMinion.device.brand);
    }

    /**
     * Record command for current minion status.
     * @param minionId minion to record for.
     * @param statusToRecordFor The status to record command for.
     */
    public async recordCommand(minionId: string, statusToRecordFor: MinionStatus): Promise<void> {
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
        if (!statusToGenerateFor[minion.minionType]) {
            throw {
                responseCode: 1405,
                message: 'incorrect minion status for current minion type',
            } as ErrorResponse;
        }

        await this.modulesManager.generateCommand(minion, statusToGenerateFor);
    }
}

export const MinionsBlSingleton = new MinionsBl(MinionsDalSingleton, DevicesBlSingleton, ModulesManagerSingltone);
