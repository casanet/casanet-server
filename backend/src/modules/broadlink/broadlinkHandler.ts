import * as moment from 'moment';
import { Duration } from 'moment';
import { AirConditioning, DeviceKind, ErrorResponse, Minion, MinionStatus, SwitchOptions, Toggle } from '../../models/sharedInterfaces';
import { BrandModuleBase } from '../brandModuleBase';

// tslint:disable-next-line:no-var-requires
const Broadlink = require('./broadlinkProtocol');
// tslint:disable-next-line:no-var-requires
const BroadlinkCodeGeneration = require('./commands-generator');

interface AirConditioningCommand {
    command: string;
    status: AirConditioning;
}

interface Cache {
    minionId: string;
    lastStatus: MinionStatus;
    toggleCommands?: { on: string, off: string };
    acCommands?: {
        off: string;
        statusCommands: AirConditioningCommand[];
    };
}

export class BroadlinkHandler extends BrandModuleBase {

    private cache: Cache[] = [];

    public readonly brandName: string = 'broadlink';

    public readonly devices: DeviceKind[] = [
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: 1,
            model: 'SP2',
            suppotedMinionType: 'switch',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'RM3 / RM Pro as IR AC',
            suppotedMinionType: 'airConditioning',
            isRecordingSupported: true,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'RM Pro as RF toggle',
            suppotedMinionType: 'toggle',
            isRecordingSupported: true,
        },
    ];

    constructor() {
        super();
        const cache = super.getCacheDataSync();
        if (cache) {
            this.cache = cache;
        }
    }

    private updateCache() {
        this.setCacheData(this.cache)
            .then(() => { })
            .catch(() => { });
    }

    private getOrCreateMinionCache(miniom: Minion): Cache {
        for (const minionCache of this.cache) {
            if (minionCache.minionId === miniom.minionId) {
                return minionCache;
            }
        }

        /** Case there is not cache struct for minion, create it */
        const newMinionCache: Cache = {
            minionId: miniom.minionId,
            lastStatus: undefined,
        };

        this.cache.push(newMinionCache);
        this.updateCache();
        return newMinionCache;
    }

    /**
     * Get IR command (HEX string) for given status. for AC only.
     * @param airConditioningCommands array of all commands to find command in.
     * @param airConditioningStatus The AC status to get command for.
     * @returns IR code struct or undefined if not exist.
     */
    private getMinionACStatusCommand(airConditioningCommands: AirConditioningCommand[],
        airConditioningStatus: AirConditioning): AirConditioningCommand {
        for (const airConditioningCommand of airConditioningCommands) {
            if (airConditioningCommand.status.fanStrength === airConditioningStatus.fanStrength &&
                airConditioningCommand.status.mode === airConditioningStatus.mode &&
                airConditioningCommand.status.temperature === airConditioningStatus.temperature) {
                return airConditioningCommand;
            }
        }
    }

    private async getSP2Status(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
        return new Promise<MinionStatus | ErrorResponse>((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 },
                miniom.device.pysicalDevice.mac, (err) => {
                    if (err) {
                        reject({
                            responseCode: 1503,
                            message: 'Connection to device fail',
                        } as ErrorResponse);
                        return;
                    }

                    broadlinkDevice.checkPower((err2, state) => {
                        if (err2) {
                            reject({
                                responseCode: 7503,
                                message: 'Getting status fail',
                            } as ErrorResponse);
                            return;
                        }

                        resolve({
                            switch: {
                                status: state ? 'on' : 'off',
                            },
                        });
                    });
                });
        });
    }

    private async setSP2Status(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        return new Promise<void | ErrorResponse>((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 },
                miniom.device.pysicalDevice.mac, (err) => {
                    if (err) {
                        reject({
                            responseCode: 1503,
                            message: 'Connection to device fail',
                        } as ErrorResponse);
                        return;
                    }

                    broadlinkDevice.setPower(setStatus.switch.status === 'on' ? true : false, (err2) => {
                        if (err2) {
                            reject({
                                responseCode: 6503,
                                message: 'Setting status fail',
                            } as ErrorResponse);
                            return;
                        }

                        resolve();
                    });
                });
        });
    }

    /**
     * Get last status, use in all devices that not holing any data, such as IR transmitter.
     * @param miniom minion to get last status for.
     */
    private async getCachedStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
        return new Promise<MinionStatus | ErrorResponse>((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 },
                miniom.device.pysicalDevice.mac, (err) => {
                    if (err) {
                        reject({
                            responseCode: 1503,
                            message: 'Connection to device fail',
                        } as ErrorResponse);
                        return;
                    }

                    const minionCache = this.getOrCreateMinionCache(miniom);
                    if (!minionCache.lastStatus) {
                        reject({
                            responseCode: 5503,
                            message: 'Current status is unknown, no history for current one-way transmitter',
                        } as ErrorResponse);
                        return;
                    }

                    resolve(minionCache.lastStatus);
                });
        });
    }

    private async setRFToggleStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        return new Promise<void | ErrorResponse>((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 },
                miniom.device.pysicalDevice.mac, (err) => {
                    if (err) {
                        reject({
                            responseCode: 1503,
                            message: 'Connection to device fail',
                        } as ErrorResponse);
                        return;
                    }

                    const minionCache = this.getOrCreateMinionCache(miniom);

                    if (!minionCache.toggleCommands) {
                        reject({
                            responseCode: 4503,
                            message: 'there is no availble command. record a on off commands set.',
                        } as ErrorResponse);
                        return;
                    }

                    const hexCommandCode = setStatus.toggle.status === 'on'
                        ? minionCache.toggleCommands.on
                        : minionCache.toggleCommands.off;
                    broadlinkDevice.sendData(hexCommandCode, (err2) => {
                        if (err2) {
                            reject(err2);
                            return;
                        }

                        minionCache.lastStatus = setStatus;
                        this.updateCache();
                        resolve();
                    });
                });
        });
    }

    private async setIRACSwitchStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        return new Promise<void | ErrorResponse>((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 },
                miniom.device.pysicalDevice.mac, (err) => {
                    if (err) {
                        reject({
                            responseCode: 1503,
                            message: 'Connection to device fail',
                        } as ErrorResponse);
                        return;
                    }

                    const minionCache = this.getOrCreateMinionCache(miniom);

                    if (!minionCache.acCommands) {
                        reject({
                            responseCode: 3503,
                            message: 'there is no any command',
                        } as ErrorResponse);
                        return;
                    }

                    let hexCommandCode: string;

                    /**
                     * If the request is to set off, get the off command.
                     */
                    if (setStatus.airConditioning.status === 'off') {
                        hexCommandCode = minionCache.acCommands.off;
                    } else {
                        /**
                         * Else try to get the correct command for given status to set.
                         */
                        const acCommand =
                            this.getMinionACStatusCommand(minionCache.acCommands.statusCommands, setStatus.airConditioning);

                        /** If there is command, get it. */
                        hexCommandCode = acCommand ? acCommand.command : '';
                    }

                    if (!hexCommandCode) {
                        reject({
                            responseCode: 4503,
                            message: 'there is no availble command for current status. record a new command.',
                        } as ErrorResponse);
                        return;
                    }

                    broadlinkDevice.sendData(hexCommandCode, (err2) => {
                        if (err2) {
                            reject(err2);
                            return;
                        }

                        minionCache.lastStatus = setStatus;
                        this.updateCache();
                        resolve();
                    });
                });
        });
    }

    private async recordIRACCommands(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        return new Promise<void | ErrorResponse>((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: miniom.device.pysicalDevice.ip, port: 80 },
                miniom.device.pysicalDevice.mac, (err) => {
                    if (err) {
                        reject({
                            responseCode: 1503,
                            message: 'Connection to device fail',
                        } as ErrorResponse);
                        return;
                    }

                    const minionCache = this.getOrCreateMinionCache(miniom);

                    if (!minionCache.acCommands) {
                        minionCache.acCommands = {
                            off: '',
                            statusCommands: [],
                        };
                    }

                    broadlinkDevice.enterLearning(moment.duration(5, 'seconds').asMilliseconds(), (err2, hexIRCommand) => {
                        if (err2) {
                            reject({
                                responseCode: 2503,
                                message: 'Recording fail or timeout',
                            } as ErrorResponse);
                            return;
                        }

                        /** If status is off, jusr save it. */
                        if (statusToRecordFor.airConditioning.status === 'off') {
                            minionCache.acCommands.off = hexIRCommand;
                        } else {

                            /** Else, get record objec if exsit and update command */
                            let statusCommand =
                                this.getMinionACStatusCommand(minionCache.acCommands.statusCommands, statusToRecordFor.airConditioning);

                            /** If command object not exist yet, create new one and add it to commands array */
                            if (!statusCommand) {
                                statusCommand = {
                                    command: '',
                                    status: statusToRecordFor.airConditioning,
                                };
                                minionCache.acCommands.statusCommands.push(statusCommand);
                            }

                            statusCommand.command = hexIRCommand;
                        }
                        this.updateCache();
                        resolve();
                    });
                });
        });
    }

    private async generateRFCommand(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {

        const generatedCode = BroadlinkCodeGeneration.generate('RF433');

        const minionCache = this.getOrCreateMinionCache(miniom);

        if (!minionCache.toggleCommands) {
            minionCache.toggleCommands = {
                on: undefined,
                off: undefined,
            };
        }

        if (statusToRecordFor.toggle.status === 'on') {
            minionCache.toggleCommands.on = generatedCode;
        } else {
            minionCache.toggleCommands.off = generatedCode;
        }

        this.updateCache();
    }

    private async recordRFToggleCommands(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        // TODO: swap and then record.
        throw {
            responseCode: 5501,
            message: 'Not implemented yet.',
        } as ErrorResponse;
    }

    public async getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
        switch (miniom.device.model) {
            case 'SP2':
                return await this.getSP2Status(miniom);
            case 'RM Pro as RF toggle':
                return await this.getCachedStatus(miniom);
            case 'RM3 / RM Pro as IR AC':
                return await this.getCachedStatus(miniom);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        } as ErrorResponse;
    }

    public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        switch (miniom.device.model) {
            case 'SP2':
                return await this.setSP2Status(miniom, setStatus);
            case 'RM Pro as RF toggle':
                return await this.setRFToggleStatus(miniom, setStatus);
            case 'RM3 / RM Pro as IR AC':
                return await this.setIRACSwitchStatus(miniom, setStatus);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        } as ErrorResponse;
    }

    public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        switch (miniom.device.model) {
            case 'RM Pro as RF toggle':
                return await this.recordRFToggleCommands(miniom, statusToRecordFor);
            case 'RM3 / RM Pro as IR AC':
                return await this.recordIRACCommands(miniom, statusToRecordFor);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        } as ErrorResponse;
    }

    public async generateCommand(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        switch (miniom.device.model) {
            case 'RM Pro as RF toggle':
                return await this.generateRFCommand(miniom, statusToRecordFor);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        } as ErrorResponse;
    }

    public async refreshCommunication(): Promise<void> {
        // There's nothing to do.
    }
}
