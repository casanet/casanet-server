"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const randomstring = require("randomstring");
const logger_1 = require("../../../backend/src/utilities/logger");
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
        let isLocalSereverMacInUse = false;
        try {
            await this.getlocalServersByMac(localServer.macAddress);
            isLocalSereverMacInUse = true;
        }
        catch (error) { }
        if (isLocalSereverMacInUse) {
            throw {
                responseCode: 5001,
                message: 'local server with given mac address already exsit',
            };
        }
        /** Generate id to local server */
        localServer.localServerId = randomstring.generate(5);
        localServer.connectionStatus = false;
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
        /** There is no point to update status from client. */
        localServer.connectionStatus = currentLocalServer.connectionStatus;
        /** save update */
        await this.localServersDal.updateLocalServer(localServer);
    }
    /**
     * Change local server status property.
     * @param localServerId local server to set status.
     * @param status The new status.
     */
    async setLocalServerConnectionStatus(localServerId, status) {
        try {
            const localServer = await this.getlocalServersById(localServerId);
            localServer.connectionStatus = status;
        }
        catch (error) {
            logger_1.logger.debug(`faile to set ${localServerId} status ${status}, local server not exists`);
        }
    }
    /**
     * Remove local server from system
     * @param localServerId local server to remove.
     */
    async deleteLocalServer(localServerId) {
        return await this.localServersDal.deleteLocalServer(localServerId);
    }
    /**
     * Add email account to local server valid to forward collection.
     * @param localServerId The local server to add the account to.
     * @param email The email account to add.
     */
    async addAccountForwardValid(localServerId, email) {
        const localServer = await this.localServersDal.getLocalServer(localServerId);
        if (localServer.validUsers.indexOf(email) === -1) {
            localServer.validUsers.push(email);
            this.localServersDal.updateLocalServer(localServer);
        }
    }
    /**
     * Remove email account to local server valid to forward collection.
     * @param localServerId The local server to remove the account from.
     * @param email The email account to remove.
     */
    async removeAccountForwardValid(localServerId, email) {
        const localServer = await this.localServersDal.getLocalServer(localServerId);
        if (localServer.validUsers.indexOf(email) !== -1) {
            localServer.validUsers.splice(localServer.validUsers.indexOf(email), 1);
            this.localServersDal.updateLocalServer(localServer);
        }
    }
}
exports.LocalServersBl = LocalServersBl;
exports.LocalServersBlSingleton = new LocalServersBl(localServersDal_1.LocalServersDalSingleton);
//# sourceMappingURL=localServersBl.js.map