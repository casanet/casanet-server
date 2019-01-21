import { DeviceKind, ErrorResponse,  Minion, MinionStatus, MinionFeed } from '../../src/models/sharedInterfaces';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { Delay } from '../../src/utilities/sleep';
import * as  moment from 'moment';
import * as  randomstring from 'randomstring';

export class MinionsBlMock {

    /**
     * minions
     */
    public minionsMock: Minion[] = [];

    /**
     * Minions status update feed.
     */
    public minionFeed = new BehaviorSubject<MinionFeed>(undefined);

    constructor() {

    }

    /**
     * Find minion in minions array.
     * @param minionId minioin id.
     */
    private findMinion(minionId: string): Minion {
        for (const minion of this.minionsMock) {
            if (minion.minionId === minionId) {
                return minion;
            }
        }
    }

    /**
     * API
     */

    /**
     * Gets minons array.
     */
    public async getMinions(): Promise<Minion[]> {
        return this.minionsMock;
    }

    /**
     * Get minion by id.
     * @param minionId minion id.
     */
    public async getMinionById(minionId: string): Promise<Minion> {
        const minion = this.findMinion(minionId);

        if (!minion) {
            throw {
                responseCode: 4004,
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
        await Delay(moment.duration(2, 'seconds'));
    }

    /**
     * Scan minion real status.
     * mean update minions cache by request the device what is the real status.
     */
    public async scanMinionStatus(minionId: string): Promise<void> {
        const minioin = this.findMinion(minionId);
        if (!minioin) {
            throw {
                responseCode: 4004,
                message: 'minion not exist',
            } as ErrorResponse;
        }
        await Delay(moment.duration(2, 'seconds'));
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
                responseCode: 4004,
                message: 'minion not exist',
            } as ErrorResponse;
        }

        /**
         * The minion status is depend on minion type.
         */
        if (!minionStatus[minion.minionType]) {
            throw {
                responseCode: 4122,
                message: 'incorrect minion status, for current minion type',
            } as ErrorResponse;
        }

        /**
         * set the status.
         */
        // await this.modulesManager.setStatus(minion, minionStatus)
        //     .catch((err) => {
        //         minion.isProperlyCommunicated = false;
        //         throw err;
        //     })

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
    public async setMinionTimeout(minionId: string, minion: Minion): Promise<void> {
        const originalMinion = this.findMinion(minionId);
        if (!originalMinion) {
            throw {
                responseCode: 4004,
                message: 'minion not exist',
            } as ErrorResponse;
        }

        originalMinion.minionAutoTurnOffMS = minion.minionAutoTurnOffMS;

        /**
         * TODO: save updates, not all is status, some is timeout....
         */
        // this.minionsDal.saveUpdate();

        /**
         * Send minion feed update
         */
        this.minionFeed.next({
            event: 'update',
            minion: originalMinion,
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
        // const error = this.validateNewMinion(minion);
        // if (error) {
        //     throw error;
        // }

        /**
         * get local devices (to load corrent pysical info such as ip)
         */
        // const localDevices = await this.devicesBl.getDevices();
        // let foundLocalDevice = false;
        // for (const localDevice of localDevices) {
        //     if (localDevice.mac === minion.device.pysicalDevice.mac) {
        //         minion.device.pysicalDevice = localDevice;
        //         foundLocalDevice = true;
        //         break;
        //     }
        // }

        // if (!foundLocalDevice) {
        //     throw {
        //         responseCode: 4522,
        //         message: 'device not exist in lan network',
        //     } as ErrorResponse;
        // }

        /**
         * Generate new id. (never trust client....)
         */
        minion.minionId = randomstring.generate(5);

        /**
         * Create new minion in dal.
         */
        // await this.minionsDal.createMinion(minion);

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
        // await this.modulesManager.getStatus(minion)
        //     .then((status: MinionStatus) => {
        //         minion.minionStatus = status;
        //     })
        //     .catch(() => {

        //     });
    }

    /**
     * Delete minoin
     * @param minionId minion id to delete
     */
    public async deleteMinion(minionId: string): Promise<void> {
        const originalMinion = this.findMinion(minionId);
        if (!originalMinion) {
            throw {
                responseCode: 4004,
                message: 'minion not exist',
            } as ErrorResponse;
        }

        // await this.minionsDal.deleteMinion(originalMinion);

        // The minoins arrat is given from DAL by ref, mean if removed
        // from dal it will removed from BL too, so check if exist
        // (if in next someone will copy by val) and then remove.
        if (this.minionsMock.indexOf(originalMinion) !== -1) {
            this.minionsMock.splice(this.minionsMock.indexOf(originalMinion), 1);
        }

        this.minionFeed.next({
            event: 'removed',
            minion: originalMinion,
        });
    }
}