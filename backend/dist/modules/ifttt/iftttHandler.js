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
        ];
    }
    async getStatus(miniom) {
        /** Currently there is no API to get the real current status. */
        return miniom.minionStatus;
    }
    async setStatus(miniom, setStatus) {
        try {
            // tslint:disable-next-line:max-line-length
            await request(`https://maker.ifttt.com/trigger/${miniom.minionId}-${setStatus[miniom.minionType].status}/with/key/${miniom.device.deviceId}`);
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