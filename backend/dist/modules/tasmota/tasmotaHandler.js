"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request-promise");
const logger_1 = require("../../utilities/logger");
const brandModuleBase_1 = require("../brandModuleBase");
class TasmotaHandler extends brandModuleBase_1.BrandModuleBase {
    constructor() {
        super();
        this.brandName = 'tasmota';
        this.devices = [
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: false,
                minionsPerDevice: 1,
                model: 'switch',
                suppotedMinionType: 'switch',
                isRecordingSupported: false,
            },
        ];
    }
    async getStatus(miniom) {
        try {
            const tosmotaStatus = await request(`http://${miniom.device.pysicalDevice.ip}/cm?cmnd=Power`);
            const status = JSON.parse(tosmotaStatus).POWER.toLowerCase();
            return {
                switch: {
                    status,
                },
            };
        }
        catch (error) {
            logger_1.logger.warn(`Sent Tosmota command ${miniom.minionId} fail, ${JSON.stringify(error.message)}`);
            throw {
                responseCode: 1503,
                message: 'tosmota request fail.',
            };
        }
    }
    async setStatus(miniom, setStatus) {
        try {
            await request(`http://${miniom.device.pysicalDevice.ip}/cm?cmnd=Power%20${setStatus[miniom.minionType].status}`);
        }
        catch (error) {
            logger_1.logger.warn(`Sent TOsmota command ${miniom.minionId} fail, ${JSON.stringify(error.message)}`);
            throw {
                responseCode: 1503,
                message: 'tosmota request fail.',
            };
        }
    }
    async enterRecordMode(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the tosmota module not support any recording mode',
        };
    }
    async generateCommand(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the tosmota module not support any recording mode',
        };
    }
    async refreshCommunication() {
        // There's nothing to do.
    }
}
exports.TasmotaHandler = TasmotaHandler;
//# sourceMappingURL=tasmotaHandler.js.map