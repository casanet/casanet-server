"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise");
const logger_1 = require("../../utilities/logger");
const brandModuleBase_1 = require("../brandModuleBase");
class IftttHandler extends brandModuleBase_1.BrandModuleBase {
    constructor() {
        super();
        this.brandName = 'ifttt';
        this.devices = [
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: true,
                minionsPerDevice: -1,
                model: 'toggle',
                suppotedMinionType: 'toggle',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: true,
                minionsPerDevice: -1,
                model: 'switch',
                suppotedMinionType: 'switch',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: true,
                minionsPerDevice: -1,
                model: 'air conditioning',
                suppotedMinionType: 'airConditioning',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: true,
                minionsPerDevice: -1,
                model: 'light',
                suppotedMinionType: 'light',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: true,
                minionsPerDevice: -1,
                model: 'temperature light',
                suppotedMinionType: 'temperatureLight',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: true,
                minionsPerDevice: -1,
                model: 'color light',
                suppotedMinionType: 'colorLight',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: true,
                minionsPerDevice: -1,
                model: 'roller',
                suppotedMinionType: 'roller',
                isRecordingSupported: false,
            },
        ];
    }
    async getStatus(miniom) {
        /** Currently there is no API to get the real current status. */
        return miniom.minionStatus;
    }
    async setStatus(miniom, setStatus) {
        let triggerPayload = `${miniom.minionId}-${setStatus[miniom.minionType].status}`;
        if (setStatus[miniom.minionType].status === 'on') {
            switch (miniom.minionType) {
                case 'airConditioning':
                    // tslint:disable-next-line:max-line-length
                    triggerPayload += `-${setStatus.airConditioning.mode}-${setStatus.airConditioning.fanStrength}-${setStatus.airConditioning.temperature}`;
                    break;
                case 'light':
                    triggerPayload += `-${setStatus.light.brightness}`;
                    break;
                case 'temperatureLight':
                    triggerPayload += `-${setStatus.temperatureLight.brightness}-${setStatus.temperatureLight.temperature}`;
                    break;
                case 'colorLight':
                    // tslint:disable-next-line:max-line-length
                    triggerPayload += `-${setStatus.colorLight.brightness}-${setStatus.colorLight.temperature}-${setStatus.colorLight.red}-${setStatus.colorLight.green}-${setStatus.colorLight.blue}`;
                    break;
                case 'roller':
                    triggerPayload += `-${setStatus.roller.direction}`;
                    break;
            }
        }
        try {
            // tslint:disable-next-line:max-line-length
            await request(`https://maker.ifttt.com/trigger/${triggerPayload}/with/key/${miniom.device.deviceId}`);
        }
        catch (error) {
            logger_1.logger.warn(`Sent IFTTT trigger for ${miniom.minionId} fail, ${JSON.stringify(error.message)}`);
            throw {
                responseCode: 7409,
                message: 'Ifttt triggger fail.',
            };
        }
    }
    async enterRecordMode(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the ifttt module not support any recording mode',
        };
    }
    async generateCommand(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the ifttt module not support any recording mode',
        };
    }
    async refreshCommunication() {
        // There's nothing to do.
    }
}
exports.IftttHandler = IftttHandler;
//# sourceMappingURL=iftttHandler.js.map