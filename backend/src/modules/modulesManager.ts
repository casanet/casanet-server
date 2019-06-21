import { PullBehavior } from 'pull-behavior';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { DeviceKind, ErrorResponse, Minion, MinionDevice, MinionStatus } from '../models/sharedInterfaces';
import { BrandModuleBase } from './brandModuleBase';

///////////////////////////////////////////////////////////////////////////////
//////////////// TO EXTEND: Place here handler reference //////////////////////
///////////////////////////////////////////////////////////////////////////////
import { BroadlinkHandler } from './broadlink/broadlinkHandler';
import { IftttHandler } from './ifttt/iftttHandler';
import { MiioHandler } from './miio/miioHandler';
import { MockHandler } from './mock/mockHandler';
import { MqttHandler } from './mqtt/mqttHandler';
import { OrviboHandler } from './orvibo/orviboHandler';
import { TasmotaHandler } from './tasmota/tasmotaHandler';
import { TuyaHandler } from './tuya/tuyaHandler';
import { YeelightHandler } from './yeelight/yeelightHandler';

export class ModulesManager {

    /**
     * All modules handlers
     */
    private modulesHandlers: BrandModuleBase[] = [];

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
        this.initHandler(new TasmotaHandler());
        this.initHandler(new BroadlinkHandler());
        this.initHandler(new YeelightHandler());
        this.initHandler(new OrviboHandler());
        this.initHandler(new IftttHandler());
        this.initHandler(new MiioHandler());
        this.initHandler(new MqttHandler());

    }

    /**
     * Hold the hendler instance and registar to minions status changed.
     * @param brandModule the handler instance.
     */
    private initHandler(brandModule: BrandModuleBase): void {

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
    private getMinionModule(brandName: string): BrandModuleBase {
        for (const brandHandler of this.modulesHandlers) {
            if (brandName === brandHandler.brandName) {
                return brandHandler;
            }
        }
    }

    /**
     * Get DeviceKind of minoin device.
     * @param minionsBrandModuleBase The rand module to look in.
     * @param minionDevice the minoin device to get kind for.
     * @returns The device kind.
     */
    private getModelKind(minionsBrandModuleBase: BrandModuleBase, minionDevice: MinionDevice): DeviceKind {
        for (const deviceKind of minionsBrandModuleBase.devices) {
            if (deviceKind.brand === minionDevice.brand &&
                deviceKind.model === minionDevice.model) {
                return deviceKind;
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
                responseCode: 7404,
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
                responseCode: 7404,
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
                responseCode: 7404,
                message: `there is not module for -${miniom.device.brand}- brand`,
            };
            throw errorResponse;
        }

        /** Make sure that minion supprt recording */
        const modelKind = this.getModelKind(minionModule, miniom.device);
        if (!modelKind || !modelKind.isRecordingSupported) {
            const errorResponse: ErrorResponse = {
                responseCode: 6409,
                message: `the minioin not support command recording or sending`,
            };
            throw errorResponse;
        }

        return await minionModule.enterRecordMode(miniom, statusToRecordFor);
    }

    /**
     * Generate an RF or IR command for given status.
     * Note, only a few devices models support this feature.
     * For example, it is used to generate RF command to the RF wall switch, instead of buying remote and record the commands.
     * @param minion minion to generate for.
     * @param statusToGenerateFor the specific status to record for.
     */
    public async generateCommand(minion: Minion, statusToGenerateFor: MinionStatus): Promise<void | ErrorResponse> {
        const minionModule = this.getMinionModule(minion.device.brand);

        if (!minionModule) {
            const errorResponse: ErrorResponse = {
                responseCode: 7404,
                message: `there is not module for -${minion.device.brand}- brand`,
            };
            throw errorResponse;
        }

        /** Make sure that minion supprt recording */
        const modelKind = this.getModelKind(minionModule, minion.device);
        if (!modelKind || !modelKind.isRecordingSupported) {
            const errorResponse: ErrorResponse = {
                responseCode: 6409,
                message: `the minioin not support command recording or sending`,
            };
            throw errorResponse;
        }

        return await minionModule.generateCommand(minion, statusToGenerateFor);
    }

    /**
     * Refresh and reset all module communications.
     * Used for cleaning up communication before re-reading data, after communication auth changed or just hard reset module etc.
     */
    public async refreshModules(): Promise<void> {
        for (const brandHandler of this.modulesHandlers) {
            await brandHandler.refreshCommunication();
        }
    }

    /**
     * Reset module communication.
     * @param brand Brand module to reset.
     */
    public async refreshModule(brand: string): Promise<void> {
        const minionModule = this.getMinionModule(brand);

        if (!minionModule) {
            const errorResponse: ErrorResponse = {
                responseCode: 7404,
                message: `there is not module for -${brand}- brand`,
            };
            throw errorResponse;
        }

        await minionModule.refreshCommunication();
    }
}

export const ModulesManagerSingltone = new ModulesManager();
