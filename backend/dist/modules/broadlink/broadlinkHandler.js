"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const sleep_1 = require("../../utilities/sleep");
const brandModuleBase_1 = require("../brandModuleBase");
// tslint:disable-next-line:no-var-requires
const Broadlink = require('./broadlinkProtocol');
// tslint:disable-next-line:no-var-requires
const BroadlinkCodeGeneration = require('./commands-generator');
class BroadlinkHandler extends brandModuleBase_1.BrandModuleBase {
    constructor() {
        super();
        this.cache = [];
        this.brandName = 'broadlink';
        this.devices = [
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
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: false,
                minionsPerDevice: -1,
                model: 'RM Pro as RF roller',
                suppotedMinionType: 'roller',
                isRecordingSupported: true,
            },
        ];
        const cache = super.getCacheDataSync();
        if (cache) {
            this.cache = cache;
        }
    }
    updateCache() {
        this.setCacheData(this.cache)
            .then(() => { })
            .catch(() => { });
    }
    getOrCreateMinionCache(miniom) {
        for (const minionCache of this.cache) {
            if (minionCache.minionId === miniom.minionId) {
                return minionCache;
            }
        }
        /** Case there is not cache struct for minion, create it */
        const newMinionCache = {
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
    getMinionACStatusCommand(airConditioningCommands, airConditioningStatus) {
        for (const airConditioningCommand of airConditioningCommands) {
            if (airConditioningCommand.status.fanStrength === airConditioningStatus.fanStrength &&
                airConditioningCommand.status.mode === airConditioningStatus.mode &&
                airConditioningCommand.status.temperature === airConditioningStatus.temperature) {
                return airConditioningCommand;
            }
        }
    }
    /** Get broadlink protocol handler instance for given minion */
    async getBroadlinkInstance(minoin) {
        return new Promise((resolve, reject) => {
            const broadlinkDevice = new Broadlink({ address: minoin.device.pysicalDevice.ip, port: 80 }, minoin.device.pysicalDevice.mac, (err) => {
                if (err) {
                    reject({
                        responseCode: 1503,
                        message: 'Connection to device fail',
                    });
                    return;
                }
                resolve(broadlinkDevice);
            });
        });
    }
    /** Send RF/IR command */
    async sendBeamCommand(broadlink, beamCommand) {
        return new Promise((resolve, reject) => {
            broadlink.sendData(beamCommand, (err) => {
                if (err) {
                    reject({
                        responseCode: 11503,
                        message: 'Sending beam command fail.',
                    });
                    return;
                }
                resolve();
            });
        });
    }
    /** Enter learn mode */
    async enterBeamLearningMode(broadlink) {
        return new Promise((resolve, reject) => {
            broadlink.enterLearning(moment.duration(5, 'seconds').asMilliseconds(), (err, hexStringCommand) => {
                if (err) {
                    reject({
                        responseCode: 2503,
                        message: 'Recording fail or timeout',
                    });
                    return;
                }
                resolve(hexStringCommand);
            });
        });
    }
    /** Get current broadlink power */
    async getBroadlinkPowerMode(broadlink) {
        return new Promise((resolve, reject) => {
            broadlink.checkPower((err, state) => {
                if (err) {
                    reject({
                        responseCode: 7503,
                        message: 'Getting status fail',
                    });
                    return;
                }
                resolve(state ? 'on' : 'off');
            });
        });
    }
    /** Set broadlink power */
    async setBroadlinkPowerMode(broadlink, switchOptions) {
        return new Promise((resolve, reject) => {
            broadlink.setPower(switchOptions === 'on', (err) => {
                if (err) {
                    reject({
                        responseCode: 6503,
                        message: 'Setting status fail',
                    });
                    return;
                }
                resolve();
            });
        });
    }
    /**
     * Get last status, use in all devices that not holing any data, such as IR transmitter.
     * @param miniom minion to get last status for.
     */
    async getCachedStatus(miniom) {
        await this.getBroadlinkInstance(miniom);
        const minionCache = this.getOrCreateMinionCache(miniom);
        if (!minionCache.lastStatus) {
            throw {
                responseCode: 5503,
                message: 'Current status is unknown, no history for current one-way transmitter',
            };
        }
        return (minionCache.lastStatus);
    }
    async getSP2Status(miniom) {
        const broadlink = await this.getBroadlinkInstance(miniom);
        const status = await this.getBroadlinkPowerMode(broadlink);
        return {
            switch: {
                status,
            },
        };
    }
    async setSP2Status(miniom, setStatus) {
        const broadlink = await this.getBroadlinkInstance(miniom);
        await this.setBroadlinkPowerMode(broadlink, setStatus.switch.status);
    }
    async setRFToggleStatus(miniom, setStatus) {
        const broadlink = await this.getBroadlinkInstance(miniom);
        const minionCache = this.getOrCreateMinionCache(miniom);
        if (!minionCache.toggleCommands) {
            throw {
                responseCode: 4503,
                message: 'there is no availble command. record a on off commands set.',
            };
        }
        const hexCommandCode = setStatus.toggle.status === 'on'
            ? minionCache.toggleCommands.on
            : minionCache.toggleCommands.off;
        if (!hexCommandCode) {
            throw {
                responseCode: 4503,
                message: 'there is no availble command. record a on off commands set.',
            };
        }
        await this.sendBeamCommand(broadlink, hexCommandCode);
        minionCache.lastStatus = setStatus;
        this.updateCache();
    }
    async setRFRollerStatus(miniom, setStatus) {
        const broadlink = await this.getBroadlinkInstance(miniom);
        const minionCache = this.getOrCreateMinionCache(miniom);
        if (!minionCache.rollerCommands) {
            throw {
                responseCode: 4503,
                message: 'there is no availble command. record a roller commands set.',
            };
        }
        const hexCommandCode = setStatus.roller.status === 'off'
            ? minionCache.rollerCommands.off
            : setStatus.roller.direction === 'up'
                ? minionCache.rollerCommands.up
                : minionCache.rollerCommands.down;
        if (!hexCommandCode) {
            throw {
                responseCode: 4503,
                message: 'there is no availble command. record a roller commands set.',
            };
        }
        await this.sendBeamCommand(broadlink, hexCommandCode);
        minionCache.lastStatus = setStatus;
        this.updateCache();
    }
    async setIRACStatus(miniom, setStatus) {
        const broadlink = await this.getBroadlinkInstance(miniom);
        const minionCache = this.getOrCreateMinionCache(miniom);
        if (!minionCache.acCommands) {
            throw {
                responseCode: 3503,
                message: 'there is no any command',
            };
        }
        let hexCommandCode;
        /**
         * If the request is to set off, get the off command.
         */
        if (setStatus.airConditioning.status === 'off') {
            hexCommandCode = minionCache.acCommands.off;
        }
        else {
            /**
             * Else try to get the correct command for given status to set.
             */
            const acCommand = this.getMinionACStatusCommand(minionCache.acCommands.statusCommands, setStatus.airConditioning);
            /** If there is command, get it. */
            hexCommandCode = acCommand ? acCommand.command : '';
        }
        if (!hexCommandCode) {
            throw {
                responseCode: 4503,
                message: 'there is no availble command for current status. record a new command.',
            };
        }
        await this.sendBeamCommand(broadlink, hexCommandCode);
        /** In case AC has missed the sent command, send it again. */
        await sleep_1.Delay(moment.duration(1, 'seconds'));
        await this.sendBeamCommand(broadlink, hexCommandCode);
        minionCache.lastStatus = setStatus;
        this.updateCache();
    }
    async recordIRACCommands(miniom, statusToRecordFor) {
        const broadlink = await this.getBroadlinkInstance(miniom);
        const minionCache = this.getOrCreateMinionCache(miniom);
        if (!minionCache.acCommands) {
            minionCache.acCommands = {
                off: '',
                statusCommands: [],
            };
        }
        const hexIRCommand = await this.enterBeamLearningMode(broadlink);
        /** If status is off, jusr save it. */
        if (statusToRecordFor.airConditioning.status === 'off') {
            minionCache.acCommands.off = hexIRCommand;
        }
        else {
            /** Else, get record objec if exsit and update command */
            let statusCommand = this.getMinionACStatusCommand(minionCache.acCommands.statusCommands, statusToRecordFor.airConditioning);
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
    }
    async generateToggleRFCommand(miniom, statusToRecordFor) {
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
        }
        else {
            minionCache.toggleCommands.off = generatedCode;
        }
        this.updateCache();
    }
    async generateRollerRFCommand(miniom, statusToRecordFor) {
        const generatedCode = BroadlinkCodeGeneration.generate('RF433');
        const minionCache = this.getOrCreateMinionCache(miniom);
        if (!minionCache.rollerCommands) {
            minionCache.rollerCommands = {
                down: undefined,
                up: undefined,
                off: undefined,
            };
        }
        if (statusToRecordFor.roller.status === 'off') {
            minionCache.rollerCommands.off = generatedCode;
        }
        else if (statusToRecordFor.roller.direction === 'up') {
            minionCache.rollerCommands.up = generatedCode;
        }
        else {
            minionCache.rollerCommands.down = generatedCode;
        }
        this.updateCache();
    }
    async recordRFToggleCommands(miniom, statusToRecordFor) {
        // TODO: swap and then record.
        throw {
            responseCode: 5501,
            message: 'Not implemented yet.',
        };
    }
    async getStatus(miniom) {
        switch (miniom.device.model) {
            case 'SP2':
                return await this.getSP2Status(miniom);
            case 'RM Pro as RF toggle':
            case 'RM3 / RM Pro as IR AC':
            case 'RM Pro as RF roller':
                return await this.getCachedStatus(miniom);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        };
    }
    async setStatus(miniom, setStatus) {
        switch (miniom.device.model) {
            case 'SP2':
                return await this.setSP2Status(miniom, setStatus);
            case 'RM Pro as RF toggle':
                return await this.setRFToggleStatus(miniom, setStatus);
            case 'RM3 / RM Pro as IR AC':
                return await this.setIRACStatus(miniom, setStatus);
            case 'RM Pro as RF roller':
                return await this.setRFRollerStatus(miniom, setStatus);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        };
    }
    async enterRecordMode(miniom, statusToRecordFor) {
        switch (miniom.device.model) {
            case 'RM Pro as RF toggle':
                return await this.recordRFToggleCommands(miniom, statusToRecordFor);
            case 'RM3 / RM Pro as IR AC':
                return await this.recordIRACCommands(miniom, statusToRecordFor);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        };
    }
    async generateCommand(miniom, statusToRecordFor) {
        switch (miniom.device.model) {
            case 'RM Pro as RF toggle':
                return await this.generateToggleRFCommand(miniom, statusToRecordFor);
            case 'RM Pro as RF roller':
                return await this.generateRollerRFCommand(miniom, statusToRecordFor);
        }
        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        };
    }
    async refreshCommunication() {
        // There's nothing to do.
    }
}
exports.BroadlinkHandler = BroadlinkHandler;
//# sourceMappingURL=broadlinkHandler.js.map