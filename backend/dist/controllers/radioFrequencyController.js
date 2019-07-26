"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const rfBl_1 = require("../business-layer/rfBl");
let RfController = class RfController extends tsoa_1.Controller {
    /**
     * Get all aupported devices in commands repo see https://github.com/haimkastner/rf-commands-repo API.
     * @returns supported devices collection.
     */
    async getCommandsRepoAvailableDevices() {
        return await rfBl_1.RfBlSingleton.getAvailableDevicesToFetch();
    }
    /**
     * Fetch commands set for certain minion see https://github.com/haimkastner/rf-commands-repo API.
     * @param minionId minion to fetch commands for.
     * @param commandsRepoDevice devices commands set to fetch.
     */
    async fetchDeviceCommandsToMinion(minionId, commandsRepoDevice) {
        return await rfBl_1.RfBlSingleton.fetchDeviceCommandsToMinion(minionId, commandsRepoDevice);
    }
    /**
     * Record a command (IR, 433-RF or any other supported RF tech)
     * for current minion status.
     * @param minionId Minon id.
     * @param minionStatus Minion object status to get command for.
     */
    async recordMinionCommand(minionId, minionStatus) {
        return rfBl_1.RfBlSingleton.recordCommand(minionId, minionStatus);
    }
    /**
     * Generate a command (IR, 433-RF or any other supported RF tech)
     * for current minion status.
     * @param minionId Minon id.
     * @param minionStatus Minion object status to generate command for.
     */
    async generateMinionCommand(minionId, minionStatus) {
        return rfBl_1.RfBlSingleton.generateCommand(minionId, minionStatus);
    }
};
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('devices')
], RfController.prototype, "getCommandsRepoAvailableDevices", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('fetch-commands/{minionId}'),
    __param(1, tsoa_1.Body())
], RfController.prototype, "fetchDeviceCommandsToMinion", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('record/{minionId}'),
    __param(1, tsoa_1.Body())
], RfController.prototype, "recordMinionCommand", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('generate/{minionId}'),
    __param(1, tsoa_1.Body())
], RfController.prototype, "generateMinionCommand", null);
RfController = __decorate([
    tsoa_1.Tags('RF'),
    tsoa_1.Route('rf')
], RfController);
exports.RfController = RfController;
//# sourceMappingURL=radioFrequencyController.js.map