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
const remoteConnectionBl_1 = require("../business-layer/remoteConnectionBl");
const schemaValidator_1 = require("../security/schemaValidator");
const macAddress_1 = require("../utilities/macAddress");
let RemoteConnectionController = class RemoteConnectionController extends tsoa_1.Controller {
    /**
     * Get remote server host/ip.
     * or empty if not set.
     */
    async getRemoteHost() {
        return await remoteConnectionBl_1.RemoteConnectionBlSingleton.getRemoteHost();
    }
    /**
     * Get connection status to remote status.
     */
    async getConnectionStatus() {
        return remoteConnectionBl_1.RemoteConnectionBlSingleton.connectionStatus;
    }
    /**
     * Get local casa-server machine mac address.
     * Used when remote server require local server mac address befor pairing.
     */
    async getMachineMac() {
        return await macAddress_1.GetMachinMacAddress();
    }
    /**
     * Connect to remote server by given remote settings.
     */
    async setRemoteSettings(remoteSettings) {
        try {
            /** Validate remote settings */
            const validRemoteSettings = await schemaValidator_1.SchemaValidator(remoteSettings, schemaValidator_1.RemoteSettingsSchema);
            return await remoteConnectionBl_1.RemoteConnectionBlSingleton.setRemoteSettings(validRemoteSettings);
        }
        catch (error) {
            throw {
                responseCode: 2422,
                message: 'remote settings data incorrent',
            };
        }
    }
    /**
     * Remove/disconnect remote server connection.
     */
    async removeRemoteSettings() {
        return await remoteConnectionBl_1.RemoteConnectionBlSingleton.removeRemoteSettings();
    }
};
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Security('userAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get()
], RemoteConnectionController.prototype, "getRemoteHost", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Security('userAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('status')
], RemoteConnectionController.prototype, "getConnectionStatus", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('machine-mac')
], RemoteConnectionController.prototype, "getMachineMac", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put(),
    __param(0, tsoa_1.Body())
], RemoteConnectionController.prototype, "setRemoteSettings", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Delete()
], RemoteConnectionController.prototype, "removeRemoteSettings", null);
RemoteConnectionController = __decorate([
    tsoa_1.Tags('Remote'),
    tsoa_1.Route('remote')
], RemoteConnectionController);
exports.RemoteConnectionController = RemoteConnectionController;
//# sourceMappingURL=remoteConnectionController.js.map