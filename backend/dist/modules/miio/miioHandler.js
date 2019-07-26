"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const miio = require("miio");
const brandModuleBase_1 = require("../brandModuleBase");
class MiioHandler extends brandModuleBase_1.BrandModuleBase {
    constructor() {
        super();
        this.brandName = 'miio';
        this.devices = [
            {
                brand: this.brandName,
                isTokenRequierd: true,
                isIdRequierd: false,
                minionsPerDevice: 1,
                model: 'Robot vacuum',
                suppotedMinionType: 'cleaner',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: true,
                isIdRequierd: false,
                minionsPerDevice: 1,
                model: 'Philips ceiling',
                suppotedMinionType: 'temperatureLight',
                isRecordingSupported: false,
            },
        ];
    }
    async getFanSpeed(device) {
        const rawSpeed = await device.fanSpeed();
        switch (rawSpeed) {
            case 38: return 'low';
            case 60: return 'med';
            case 77: return 'high';
        }
        return 'auto';
    }
    async setFanSpeed(device, fanStrengt) {
        let rawSpeed = 60;
        switch (fanStrengt) {
            case 'low':
                rawSpeed = 38;
                break;
            case 'med':
                rawSpeed = 60;
                break;
            case 'high':
                rawSpeed = 77;
                break;
        }
        await device.call('set_custom_mode', [rawSpeed]);
    }
    async setVaccumStatus(device, setStatus) {
        if (setStatus.status === 'off') {
            await await device.call('app_pause');
            return;
        }
        await this.setFanSpeed(device, setStatus.fanSpeed);
        switch (setStatus.mode) {
            case 'clean':
                await device.call('app_start');
                break;
            case 'dock':
                await device.call('app_pause');
                await device.call('app_charge');
                break;
        }
    }
    async getVaccumStatus(device) {
        const statuses = (await device.call('get_status'))[0];
        const status = statuses.in_cleaning ? 'on' : 'off';
        const fanSpeed = await this.getFanSpeed(device);
        /** 8 == charging, 6 == going to the dock */
        const mode = statuses.state === 8 || statuses.state === 6
            ? 'dock'
            : 'clean';
        return {
            fanSpeed,
            mode,
            status,
        };
    }
    async setTempLightStatus(device, setStatus) {
        await device.call('set_power', [setStatus.status]);
        if (setStatus.status === 'on') {
            await device.call('set_bricct', [setStatus.brightness, setStatus.temperature]);
        }
    }
    async getTempLightStatus(device) {
        const status = (await device.call('get_prop', ['power']))[0];
        const brightness = (await device.call('get_prop', ['bright']))[0];
        const temperature = (await device.call('get_prop', ['cct']))[0];
        return {
            temperature,
            brightness,
            status,
        };
    }
    async getStatus(miniom) {
        try {
            const device = await miio.device({ address: miniom.device.pysicalDevice.ip, token: miniom.device.token });
            let currentStatus;
            switch (miniom.minionType) {
                case 'cleaner':
                    currentStatus = {
                        cleaner: await this.getVaccumStatus(device),
                    };
                    break;
                case 'temperatureLight':
                    currentStatus = {
                        temperatureLight: await this.getTempLightStatus(device),
                    };
                    break;
                default:
                    throw {
                        responseCode: 8404,
                        message: 'unknown minion model',
                    };
            }
            device.destroy();
            return currentStatus;
        }
        catch (error) {
            throw {
                responseCode: 1503,
                message: 'communication with miio device fail',
            };
        }
    }
    async setStatus(miniom, setStatus) {
        try {
            const device = await miio.device({ address: miniom.device.pysicalDevice.ip, token: miniom.device.token });
            switch (miniom.minionType) {
                case 'cleaner':
                    await this.setVaccumStatus(device, setStatus.cleaner);
                    break;
                case 'temperatureLight':
                    await this.setTempLightStatus(device, setStatus.temperatureLight);
                    break;
                default:
                    throw {
                        responseCode: 8404,
                        message: 'unknown minion model',
                    };
            }
            device.destroy();
        }
        catch (error) {
            throw {
                responseCode: 1503,
                message: 'communication with miio device fail',
            };
        }
    }
    async enterRecordMode(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the miio module not support any recording mode',
        };
    }
    async generateCommand(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the miio module not support any recording mode',
        };
    }
    async setFetchedCommands(minion, commandsSet) {
        // There's nothing to do.
    }
    async refreshCommunication() {
        // There's nothing to do.
    }
}
exports.MiioHandler = MiioHandler;
//# sourceMappingURL=miioHandler.js.map