import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { DeviceKind, ErrorResponse, Minion, MinionStatus } from '../models/sharedInterfaces';
import { PullBehavior } from '../utilities/pullBehavior';
import { MinionsBrandModuleBase } from './MinionsBrandModuleBase';

///////////////////////////////////////////////////////////////////////////////
//////////////// TO EXTEND: Place here handler reference //////////////////////
///////////////////////////////////////////////////////////////////////////////
import { MockHandler } from './mock/mockHandler';
import { TuyaHandler } from './tuya/tuyaHandler';

export class ModulesManager {

    /**
     * All modules handlers
     */
    private modulesHandlers: MinionsBrandModuleBase[] = [];

    /**
     * Let subscribe to any status minion changed. from any brand module.
     */
    public minionStatusChangedEvent = new BehaviorSubject<{
        minionId: string;
        status: MinionStatus;
    }>(undefined);

    /**
     * Get all devices kinds of all brands.
     */
    public get devicesKind(): DeviceKind[] {
        const modulesDevices: DeviceKind[] = [];
        for (const moduleHandler of this.modulesHandlers) {
            modulesDevices.push(...moduleHandler.devices);
        }
        return modulesDevices;
    }

    /**
     * Allows to retrieve minions array. (used as proxy for all moduls).
     */
    public retrieveMinions: PullBehavior<Minion[]> = new PullBehavior<Minion[]>();

    constructor() {
        this.initHandlers();
    }

    /**
     * Init any brand module in system.
     */
    private initHandlers(): void {

        ////////////////////////////////////////////////////////////////////////
        //////////////// TO EXTEND: Init here new handler //////////////////////
        ////////////////////////////////////////////////////////////////////////
        this.initHandler(new MockHandler());
        this.initHandler(new TuyaHandler());
    }

    /**
     * Hold the hendler instance and registar to minions status changed.
     * @param brandModule the handler instance.
     */
    private initHandler(brandModule: MinionsBrandModuleBase): void {

        /**
         * Set pull proxy method to get all last minions array.
         */
        brandModule.retrieveMinions.setPullMethod(async (): Promise<Minion[]> => {
            if (!this.retrieveMinions.isPullingAvailble) {
                return [];
            }
            return await this.retrieveMinions.pull();
        });

        brandModule.minionStatusChangedEvent.subscribe((changedMinionStatus) => {
            this.minionStatusChangedEvent.next(changedMinionStatus);
        });

        this.modulesHandlers.push(brandModule);
    }

    /**
     * Get minion communcation module based on brand name.
     * @param brandName the brand name.
     * @returns The module instance or undefined if not exist.
     */
    private getMinionModule(brandName: string): MinionsBrandModuleBase {
        for (const brandHandler of this.modulesHandlers) {
            if (brandName === brandHandler.brandName) {
                return brandHandler;
            }
        }
    }

    /**
     * Get current status of minion. (such as minion status on off etc.)
     */
    public async getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
        const minionModule = this.getMinionModule(miniom.device.brand);

        if (!minionModule) {
            const errorResponse: ErrorResponse = {
                responseCode: 4004,
                message: `there is not module for -${miniom.device.brand}- brand`,
            };
            throw errorResponse;
        }
        return await minionModule.getStatus(miniom);
    }

    /**
     * Set minion new status. (such as turn minion on off etc.)
     * @param miniom minion to set status for.
     * @param setStatus the new status to set.
     */
    public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        const minionModule = this.getMinionModule(miniom.device.brand);

        if (!minionModule) {
            const errorResponse: ErrorResponse = {
                responseCode: 4004,
                message: `there is not module for -${miniom.device.brand}- brand`,
            };
            throw errorResponse;
        }
        return await minionModule.setStatus(miniom, setStatus);
    }

    /**
     * Record data for currrent minion status.
     * Note, only few devices models support this feature.
     * For example it is used when need to record IR data to math status for next use.
     * @param miniom minion to record for.
     * @param statusToRecordFor the specific status to record for.
     */
    public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        const minionModule = this.getMinionModule(miniom.device.brand);

        if (!minionModule) {
            const errorResponse: ErrorResponse = {
                responseCode: 4004,
                message: `there is not module for -${miniom.device.brand}- brand`,
            };
            throw errorResponse;
        }
        return await minionModule.enterRecordMode(miniom, statusToRecordFor);
    }
}

export const ModulesManagerSingltone = new ModulesManager();
