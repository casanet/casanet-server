"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("../../../backend/src/data-layer/dataIO");
const LOCAL_SERVERS_FILE_NAME = 'localServers.json';
class LocalServersDal {
    constructor(dataIo) {
        this.dataIo = dataIo;
        this.localServers = dataIo.getDataSync();
    }
    /**
     * Find local server by id.
     * @param localServerId local server id.
     */
    findLocalServer(localServerId) {
        for (const localServer of this.localServers) {
            if (localServer.localServerId === localServerId) {
                return localServer;
            }
        }
    }
    /**
     * Get local servers arrray.
     */
    async getLocalServers() {
        return this.localServers;
    }
    /**
     * Get local server by id.
     */
    async getLocalServer(localServerId) {
        const localServer = this.findLocalServer(localServerId);
        if (!localServer) {
            throw {
                responseCode: 6404,
                message: 'local server not exist',
            };
        }
        return localServer;
    }
    /**
     * Save new local server.
     * @param localServer local server to save
     */
    async createLocalServer(localServer) {
        this.localServers.push(localServer);
        await this.dataIo.setData(this.localServers)
            .catch(() => {
            this.localServers.splice(this.localServers.indexOf(localServer), 1);
            throw new Error('fail to save localServer');
        });
    }
    /**
     * Delete local server by id.
     */
    async deleteLocalServer(localServerId) {
        const localServer = this.findLocalServer(localServerId);
        if (!localServer) {
            throw {
                responseCode: 6404,
                message: 'local server not exist',
            };
        }
        this.localServers.splice(this.localServers.indexOf(localServer), 1);
        await this.dataIo.setData(this.localServers)
            .catch(() => {
            this.localServers.push(localServer);
            throw new Error('fail to save local server delete request');
        });
    }
    /**
     * Update local server. (simply, replace with given..)
     * @param localServer local server properties update
     */
    async updateLocalServer(localServer) {
        const originalLocalServer = this.findLocalServer(localServer.localServerId);
        if (!originalLocalServer) {
            throw {
                responseCode: 6404,
                message: 'local server not exist',
            };
        }
        this.localServers.splice(this.localServers.indexOf(originalLocalServer), 1);
        this.localServers.push(localServer);
        await this.dataIo.setData(this.localServers)
            .catch(() => {
            this.localServers.splice(this.localServers.indexOf(localServer), 1);
            this.localServers.push(originalLocalServer);
            throw new Error('fail to save localServers update request');
        });
    }
}
exports.LocalServersDal = LocalServersDal;
exports.LocalServersDalSingleton = new LocalServersDal(new dataIO_1.DataIO(LOCAL_SERVERS_FILE_NAME));
//# sourceMappingURL=localServersDal.js.map