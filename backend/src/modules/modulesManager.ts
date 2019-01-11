import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { IMinionsBrandModule } from '../models/backendInterfaces';
import { DeviceKind, ErrorResponse, Minion, MinionStatus } from '../models/sharedInterfaces';

///////////////////////////////////////////////////////////////////////////////
//////////////// TO EXTEND: Place here handler reference //////////////////////
///////////////////////////////////////////////////////////////////////////////
import { MockHandler } from './mock/mockHandler';

export class ModulesManager {

    /**
     * All modules handlers
     */
    private modulesHandlers: IMinionsBrandModule[] = [];

    /**
     * Let subscribe to any status minion changed. from any brand module.
     */
    public minionStatusChangedEvent = new BehaviorSubject<{
        mac: string;
        status: MinionStatus;
    }>({
        mac: '',
        status: undefined,
    });

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
    }

    /**
     * Hold the hendler instance and registar to minions status changed.
     * @param brandModule the handler instance.
     */
    private initHandler(brandModule: IMinionsBrandModule): void {
        brandModule.minionStatusChangedEvent.subscribe((chamgedInfo) => {
            this.minionStatusChangedEvent.next(chamgedInfo);
        });
        this.modulesHandlers.push(brandModule);
    }

    /**
     * Get minion communcation module based on brand name.
     * @param brandName the brand name.
     * @returns The module instance or undefined if not exist.
     */
    private getMinionModule(brandName: string): IMinionsBrandModule {
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

}

export const ModulesManagerSingltone = new ModulesManager();
