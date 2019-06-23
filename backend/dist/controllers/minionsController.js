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
const minionsBl_1 = require("../business-layer/minionsBl");
const deepCopy_1 = require("../utilities/deepCopy");
let MinionsController = class MinionsController extends tsoa_1.Controller {
    /**
     * NEVER let anyone get device API keys.
     * @param minion minion to remove keys from.
     */
    cleanUpMinionBeforRelease(minion) {
        const minionCopy = deepCopy_1.DeepCopy(minion);
        delete minionCopy.device.deviceId;
        delete minionCopy.device.token;
        return minionCopy;
    }
    /**
     * NEVER let anyone get device API keys.
     * @param minions minions to remove keys from.
     */
    cleanUpMinionsBeforRelease(minions) {
        const minionsCopy = [];
        for (const minion of minions) {
            minionsCopy.push(this.cleanUpMinionBeforRelease(minion));
        }
        return minionsCopy;
    }
    /**
     * Get all minions in the system.
     * @returns Minions array.
     */
    async getMinions() {
        return this.cleanUpMinionsBeforRelease(await minionsBl_1.MinionsBlSingleton.getMinions());
    }
    /**
     * Get minion by id.
     * @returns Minion.
     */
    async getMinion(minionId) {
        return this.cleanUpMinionBeforRelease(await minionsBl_1.MinionsBlSingleton.getMinionById(minionId));
    }
    /**
     * Update minion status.
     * @param minionId Minion id.
     * @param setStatus Minion status to set.
     */
    async setMinion(minionId, setStatus) {
        return await minionsBl_1.MinionsBlSingleton.setMinionStatus(minionId, setStatus);
    }
    /**
     * Update minion name.
     * @param minionId Minion id.
     * @param name Minion new name to set.
     */
    async renameMinion(minionId, minionRename) {
        return await minionsBl_1.MinionsBlSingleton.renameMinion(minionId, minionRename.name);
    }
    /**
     * Update minion auto turns off timeout.
     * @param minionId Minon id.
     * @param setTimeout Timeout property.
     */
    async setMinionTimeout(minionId, setTimeout) {
        return await minionsBl_1.MinionsBlSingleton.setMinionTimeout(minionId, setTimeout.setAutoTurnOffMS);
    }
    /**
     * Record a command (IR, 433-RF or any other supported RF tech)
     * for current minion status.
     * @param minionId Minon id.
     * @param minionStatus Minion object status to get command for.
     */
    async recordMinionCommand(minionId, minionStatus) {
        return minionsBl_1.MinionsBlSingleton.recordCommand(minionId, minionStatus);
    }
    /**
     * Generate a command (IR, 433-RF or any other supported RF tech)
     * for current minion status.
     * @param minionId Minon id.
     * @param minionStatus Minion object status to generate command for.
     */
    async generateMinionCommand(minionId, minionStatus) {
        return minionsBl_1.MinionsBlSingleton.generateCommand(minionId, minionStatus);
    }
    /**
     * Recheck minion device status (update server status cache).
     */
    async rescanMinionStatus(minionId) {
        return await minionsBl_1.MinionsBlSingleton.scanMinionStatus(minionId);
    }
    /**
     * Recheck every minion device status (update server status cache).
     * Note that this is not the devices scan!
     * This scanning only checks every minion API to know the current status.
     */
    async rescanMinionsStatus() {
        return await minionsBl_1.MinionsBlSingleton.scanMinionsStatus();
    }
    /**
     * Delete minion from the system.
     * @param minionId Minon id.
     */
    async deleteMinion(minionId) {
        return await minionsBl_1.MinionsBlSingleton.deleteMinion(minionId);
    }
    /**
     *  Creates a new minion.
     * @param minion The new minion to create.
     */
    async createMinion(minion) {
        return await minionsBl_1.MinionsBlSingleton.createMinion(minion);
    }
    /**
     * Notify minion status changed by ifttt webhook (https://ifttt.com/maker_webhooks).
     * @param minionId Minon id.
     * @param iftttOnChanged Minion key amd status to set.
     */
    async notifyMinionStatusChanged(minionId, iftttOnChanged) {
        return await minionsBl_1.MinionsBlSingleton.notifyMinionChangedByIfttt(minionId, iftttOnChanged);
    }
};
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get()
], MinionsController.prototype, "getMinions", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Get('{minionId}')
], MinionsController.prototype, "getMinion", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('{minionId}'),
    __param(1, tsoa_1.Body())
], MinionsController.prototype, "setMinion", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('rename/{minionId}'),
    __param(1, tsoa_1.Body())
], MinionsController.prototype, "renameMinion", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('timeout/{minionId}'),
    __param(1, tsoa_1.Body())
], MinionsController.prototype, "setMinionTimeout", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('commands/record/{minionId}'),
    __param(1, tsoa_1.Body())
], MinionsController.prototype, "recordMinionCommand", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('commands/generate/{minionId}'),
    __param(1, tsoa_1.Body())
], MinionsController.prototype, "generateMinionCommand", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('rescan/{minionId}')
], MinionsController.prototype, "rescanMinionStatus", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('rescan')
], MinionsController.prototype, "rescanMinionsStatus", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Delete('{minionId}')
], MinionsController.prototype, "deleteMinion", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post(),
    __param(0, tsoa_1.Body())
], MinionsController.prototype, "createMinion", null);
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('{minionId}/ifttt'),
    __param(1, tsoa_1.Body())
], MinionsController.prototype, "notifyMinionStatusChanged", null);
MinionsController = __decorate([
    tsoa_1.Tags('Minions'),
    tsoa_1.Route('minions')
], MinionsController);
exports.MinionsController = MinionsController;
//# sourceMappingURL=minionsController.js.map