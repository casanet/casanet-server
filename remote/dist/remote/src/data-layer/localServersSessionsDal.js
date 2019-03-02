"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("../../../backend/src/data-layer/dataIO");
const LOCAL_SERVERS_SESSION_FILE_NAME = 'localServersSession.json';
class LocalServersSessionsDal {
    constructor(dataIo) {
        this.dataIo = dataIo;
        this.localServersSessions = dataIo.getDataSync();
    }
    /**
     * Find local server session by local server id.
     */
    findLocalServerSession(localServerId) {
        for (const localServer of this.localServersSessions) {
            if (localServer.localServerId === localServerId) {
                return localServer;
            }
        }
    }
    /**
     * Get local servers sessions.
     */
    async getLocalServersSessions() {
        return this.localServersSessions;
    }
    /**
     * Get local server session by local server id.
     */
    async getLocalServerSessions(localServerId) {
        const localServerSession = this.findLocalServerSession(localServerId);
        if (!localServerSession) {
            throw new Error('local server session not exist');
        }
        return localServerSession;
    }
    /**
     * Save new local server session.
     * @param localServerSession local server session to save.
     */
    async createLocalServerSession(localServerSession) {
        this.localServersSessions.push(localServerSession);
        await this.dataIo.setData(this.localServersSessions)
            .catch(() => {
            this.localServersSessions.splice(this.localServersSessions.indexOf(localServerSession), 1);
            throw new Error('fail to save localServer session');
        });
    }
    /**
     * Delete local server session.
     */
    async deleteLocalServerSession(localServerId) {
        const localServer = this.findLocalServerSession(localServerId);
        if (!localServer) {
            throw new Error('localServer session not exist');
        }
        this.localServersSessions.splice(this.localServersSessions.indexOf(localServer), 1);
        await this.dataIo.setData(this.localServersSessions)
            .catch(() => {
            this.localServersSessions.push(localServer);
            throw new Error('fail to save localServer session delete request');
        });
    }
}
exports.LocalServersSessionsDal = LocalServersSessionsDal;
exports.LocalServersSessionsDalSingleton = new LocalServersSessionsDal(new dataIO_1.DataIO(LOCAL_SERVERS_SESSION_FILE_NAME));
//# sourceMappingURL=localServersSessionsDal.js.map