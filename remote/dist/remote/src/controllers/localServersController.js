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
const channelsBl_1 = require("../business-layer/channelsBl");
const localServersBl_1 = require("../business-layer/localServersBl");
const localServersSessionsBl_1 = require("../business-layer/localServersSessionsBl");
let LocalServersController = class LocalServersController extends tsoa_1.Controller {
    /**
     * Get local servers in system.
     */
    async getLocalServers() {
        return await localServersBl_1.LocalServersBlSingleton.getlocalServers();
    }
    /**
     * Get local server by it`s id.
     */
    async getLocalServer(localServerId) {
        return await localServersBl_1.LocalServersBlSingleton.getlocalServersById(localServerId);
    }
    /**
     * Add new local server to system.
     */
    async addLocalServer(localServer) {
        return await localServersBl_1.LocalServersBlSingleton.createLocalServer(localServer);
    }
    /**
     * Update local server properties.
     * @param localServerId local server to update.
     * @param localServer new properties object to set.
     */
    async updateLocalServer(localServerId, localServer) {
        localServer.localServerId = localServerId;
        return await localServersBl_1.LocalServersBlSingleton.updateLocalServer(localServer);
    }
    /**
     * Remove local server from system.
     * @param localServerId local server to remove.
     */
    async deleteLocalServer(localServerId) {
        await localServersBl_1.LocalServersBlSingleton.deleteLocalServer(localServerId);
        /** After local server removed, remove session too. */
        await localServersSessionsBl_1.LocalServersSessionBlSingleton.deleteLocalServerSession(localServerId);
    }
    /**
     * Generate new authentication key for local server.
     * (delete current key if exsit).
     *
     * KEEP GENERATED KEY PRIVATE AND SECURE,
     * PUT IT IN YOUR LOCAL SERVER AND NEVER SHOW IT TO ANYBODY!!!
     * @param localServerId local server to generate for.
     */
    async generateAuthKeyLocalServer(localServerId) {
        return await localServersSessionsBl_1.LocalServersSessionBlSingleton.generateLocalServerSession(localServerId);
    }
    /**
     * Get all user names from local server.
     * Used to allow admin select users that can access their local server via remote.
     * @param localServerId local server to get users from.
     */
    async getLocalServerUsers(localServerId) {
        return await channelsBl_1.ChannelsBlSingleton.getLocalServerUsers(localServerId);
    }
};
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get()
], LocalServersController.prototype, "getLocalServers", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('{localServerId}')
], LocalServersController.prototype, "getLocalServer", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post(),
    __param(0, tsoa_1.Body())
], LocalServersController.prototype, "addLocalServer", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('{localServerId}'),
    __param(1, tsoa_1.Body())
], LocalServersController.prototype, "updateLocalServer", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Delete('{localServerId}')
], LocalServersController.prototype, "deleteLocalServer", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('auth/{localServerId}')
], LocalServersController.prototype, "generateAuthKeyLocalServer", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('local-users/{localServerId}')
], LocalServersController.prototype, "getLocalServerUsers", null);
LocalServersController = __decorate([
    tsoa_1.Tags('Servers'),
    tsoa_1.Route('servers')
], LocalServersController);
exports.LocalServersController = LocalServersController;
//# sourceMappingURL=localServersController.js.map