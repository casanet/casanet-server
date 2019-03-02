"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("../../../backend/src/data-layer/dataIO");
const USERS_SESSION_FILE_NAME = 'usersSession.json';
class ForwardUsersSessionsDal {
    constructor(dataIo) {
        this.dataIo = dataIo;
        this.forwardUersSessions = dataIo.getDataSync();
    }
    /**
     * Find session by session key hash.
     * @param sessionKeyHash session key hash.
     * @returns Session object or undefined if not exist.
     */
    findUserSession(sessionKeyHash) {
        for (const session of this.forwardUersSessions) {
            if (session.sessionKeyHash === sessionKeyHash) {
                return session;
            }
        }
    }
    /**
     * Get forward users sessions.
     */
    async getForwardUsersSessions() {
        return this.forwardUersSessions;
    }
    /**
     * Get session by session key hash.
     * @param sessionKeyHash session key hash.
     * @returns Session object or undefined if not exist.
     */
    async getUserSession(sessionKeyHash) {
        const userSession = this.findUserSession(sessionKeyHash);
        if (!userSession) {
            throw new Error('user session not exist');
        }
        return userSession;
    }
    /**
     * Save new ForwardUserSession.
     */
    async saveNewUserSession(userSession) {
        this.forwardUersSessions.push(userSession);
        await this.dataIo.setData(this.forwardUersSessions)
            .catch(() => {
            this.forwardUersSessions.splice(this.forwardUersSessions.indexOf(userSession), 1);
            throw new Error('fail to save user session session');
        });
    }
    /**
     * Delete forward user session, by session key hash.
     */
    async deleteUserSession(sessionKeyHash) {
        const userSession = this.findUserSession(sessionKeyHash);
        if (!userSession) {
            throw new Error('user session session not exist');
        }
        this.forwardUersSessions.splice(this.forwardUersSessions.indexOf(userSession), 1);
        await this.dataIo.setData(this.forwardUersSessions)
            .catch(() => {
            this.forwardUersSessions.push(userSession);
            throw new Error('fail to save user session session delete request');
        });
    }
}
exports.ForwardUsersSessionsDal = ForwardUsersSessionsDal;
exports.ForwardUsersSessionsDalSingleton = new ForwardUsersSessionsDal(new dataIO_1.DataIO(USERS_SESSION_FILE_NAME));
//# sourceMappingURL=forwardUsersSessionDal.js.map