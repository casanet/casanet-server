"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const randomstring = require("randomstring");
const localServersDal_1 = require("../data-layer/localServersDal");
class LocalServersBl {
    constructor(localServersDal) {
        this.localServersDal = localServersDal;
    }
    /**
     * Get all local servers.
     */
    async getlocalServers() {
        return await this.localServersDal.getLocalServers();
    }
    /**
     * Get local server by local server mac address.
     * @param macAddress local server machine/mac address.
     */
    async getlocalServersByMac(macAddress) {
        const localServers = await this.getlocalServers();
        for (const localServer of localServers) {
            if (localServer.macAddress === macAddress) {
                return localServer;
            }
        }
        throw {
            responseCode: 5001,
            message: 'local server not exsit',
        };
    }
    /**
     * Get local servers info collection of each local server that user mention as valid users
     * @param userEmail user to get local server info.
     * @returns local servers info collection.
     */
    async getLocalServerInfoByUser(userEmail) {
        const userLocalServer = [];
        for (const localServer of await this.getlocalServers()) {
            for (const user of localServer.validUsers) {
                if (user === userEmail) {
                    userLocalServer.push({
                        localServerId: localServer.localServerId,
                        displayName: localServer.displayName,
                    });
                    break;
                }
            }
        }
        return userLocalServer;
    }
    /**
     * Get local server by id.
     * @param localServerId local server id.
     * @returns local server object.
     */
    async getlocalServersById(localServerId) {
        return await this.localServersDal.getLocalServer(localServerId);
    }
    /**
     * Create new local server in system.
     * @param localServer local server to create.
     */
    async createLocalServer(localServer) {
        /** local server mac address shuold be uniqe. */
        let isLocalSereverMacIsUse = false;
        try {
            await this.getlocalServersByMac(localServer.macAddress);
            isLocalSereverMacIsUse = true;
        }
        catch (error) { }
        if (isLocalSereverMacIsUse) {
            throw {
                responseCode: 5001,
                message: 'local server with given mac address aready exsit',
            };
        }
        /** Generate id to local server */
        localServer.localServerId = randomstring.generate(5);
        /** save it */
        await this.localServersDal.createLocalServer(localServer);
    }
    /**
     * update local server proprties.
     * @param localServer local server with updated properties.
     */
    async updateLocalServer(localServer) {
        const currentLocalServer = await this.getlocalServersById(localServer.localServerId);
        /** Dont allow update mac address.  */
        if (localServer.macAddress !== currentLocalServer.macAddress) {
            throw {
                responseCode: 4005,
                message: 'changing local server mac address is unable.',
            };
        }
        /** Thre is no point to update status from client. */
        localServer.connectionStatus = currentLocalServer.connectionStatus;
        /** save update */
        await this.localServersDal.updateLocalServer(localServer);
    }
    /**
     * Remove local server from system
     * @param localServerId local server to remove.
     */
    async deleteLocalServer(localServerId) {
        return await this.localServersDal.deleteLocalServer(localServerId);
    }
}
exports.LocalServersBl = LocalServersBl;
exports.LocalServersBlSingleton = new LocalServersBl(localServersDal_1.LocalServersDalSingleton);
//# sourceMappingURL=localServersBl.js.map