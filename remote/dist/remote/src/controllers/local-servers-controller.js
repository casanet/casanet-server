"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const models_1 = require("../models");
const data_access_1 = require("../data-access");
const randomstring = require("randomstring");
const cryptoJs = require("crypto-js");
const config_1 = require("../../../backend/src/config");
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
const schemaValidator_2 = require("../security/schemaValidator");
const logic_1 = require("../logic");
let LocalServersController = class LocalServersController extends tsoa_1.Controller {
    /**
     * Get local servers in the system.
     */
    async getServers() {
        const servers = await data_access_1.getServers();
        /** Add server status to each server */
        for (const server of servers) {
            server.connectionStatus = await logic_1.ChannelsSingleton.connectionStatus(server.macAddress);
        }
        return servers;
    }
    /**
     * Add a new local server to the system.
     */
    async createServer(server) {
        try {
            server = await schemaValidator_1.SchemaValidator(server, schemaValidator_2.serverSchema);
        }
        catch (err) {
            this.setStatus(422);
            return err.error.message;
        }
        return await data_access_1.createServer(server);
    }
    /**
     * Update local server properties.
     * @param serverId local server physical address.
     * @param localServer new properties object to set.
     */
    async updateLocalServer(serverId, server) {
        try {
            server = await schemaValidator_1.SchemaValidator(server, schemaValidator_2.serverSchema);
        }
        catch (err) {
            this.setStatus(422);
            return err.error.message;
        }
        server.macAddress = serverId;
        return await data_access_1.updateServer(server);
    }
    /**
     * Remove local server from the system.
     * @param serverId local server physical address.
     */
    async deleteLocalServer(serverId) {
        await data_access_1.deleteServer(serverId);
        await logic_1.ChannelsSingleton.disconnectLocalServer(serverId);
    }
    /**
     * Generate a new authentication key for the local server.
     * (delete current key if exist).
     *
     * KEEP GENERATED KEY PRIVATE AND SECURE,
     * PUT IT IN YOUR LOCAL SERVER AND NEVER SHOW IT TO ANYBODY!!!
     * @param serverId local server physical address to generate for.
     */
    async generateAuthKeyLocalServer(serverId) {
        const server = await data_access_1.getServer(serverId);
        /** Generate key */
        const sessionKey = randomstring.generate(64);
        /**
         * Hash it to save only hash and *not* key plain text
         */
        const hashedKey = cryptoJs.SHA512(sessionKey + config_1.Configuration.keysHandling.saltHash).toString();
        /** Create session object */
        const serverSession = {
            server,
            hashedKey,
        };
        /** Update (or create if not exists) the server keys */
        await data_access_1.setServerSession(serverSession);
        /** Disconnect local server (if connected) */
        await logic_1.ChannelsSingleton.disconnectLocalServer(serverId);
        return await sessionKey;
    }
};
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocalServersController.prototype, "getServers", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post(),
    __param(0, tsoa_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [models_1.LocalServer]),
    __metadata("design:returntype", Promise)
], LocalServersController.prototype, "createServer", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('{serverId}'),
    __param(1, tsoa_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, models_1.LocalServer]),
    __metadata("design:returntype", Promise)
], LocalServersController.prototype, "updateLocalServer", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Delete('{serverId}'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocalServersController.prototype, "deleteLocalServer", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('auth/{serverId}'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocalServersController.prototype, "generateAuthKeyLocalServer", null);
LocalServersController = __decorate([
    tsoa_1.Tags('Servers'),
    tsoa_1.Route('servers')
], LocalServersController);
exports.LocalServersController = LocalServersController;
//# sourceMappingURL=local-servers-controller.js.map