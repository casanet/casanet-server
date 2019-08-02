"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const versionsBl_1 = require("../business-layer/versionsBl");
let VersionsController = class VersionsController extends tsoa_1.Controller {
    /**
     * Update CASA-net application to the latest version (Restart required for the version update complete).
     */
    async updateVersion() {
        return await versionsBl_1.VersionsBlSingleton.updateToLastVersion();
    }
    /**
     * Get current version update progress status
     */
    async getUpdateStatus() {
        return await versionsBl_1.VersionsBlSingleton.getUpdateStatus();
    }
    /**
     * Get current version.
     * @returns Current version.
     */
    async getCurrentVersion() {
        return await versionsBl_1.VersionsBlSingleton.getCurrentVersion();
    }
};
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('latest')
], VersionsController.prototype, "updateVersion", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('update-status')
], VersionsController.prototype, "getUpdateStatus", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Security('userAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get()
], VersionsController.prototype, "getCurrentVersion", null);
VersionsController = __decorate([
    tsoa_1.Tags('Version'),
    tsoa_1.Route('version')
], VersionsController);
exports.VersionsController = VersionsController;
//# sourceMappingURL=versionsController.js.map