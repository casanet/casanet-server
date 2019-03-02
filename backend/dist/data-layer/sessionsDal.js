"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("./dataIO");
const SESSION_FILE_NAME = 'sessions.json';
class SessionsDal {
    constructor(dataIo) {
        /**
         * Sessions.
         */
        this.sessions = [];
        this.dataIo = dataIo;
        this.sessions = dataIo.getDataSync();
    }
    /**
     * Find sessin in session array
     */
    findSession(key) {
        for (const session of this.sessions) {
            if (session.keyHash === key) {
                return session;
            }
        }
    }
    /**
     * Get all session as array.
     */
    async getSessions() {
        return this.sessions;
    }
    /**
     * Get session by session key.
     * @param key Find session by key.
     */
    async getSession(key) {
        const session = this.findSession(key);
        if (!session) {
            throw new Error('sessin not exist');
        }
        return session;
    }
    /**
     * Save new session.
     */
    async createSession(newSession) {
        this.sessions.push(newSession);
        await this.dataIo.setData(this.sessions)
            .catch(() => {
            this.sessions.splice(this.sessions.indexOf(newSession), 1);
            throw new Error('fail to save session');
        });
    }
    /**
     * Delete session.
     */
    async deleteSession(session) {
        const originalSession = this.findSession(session.keyHash);
        if (!originalSession) {
            throw new Error('sessin not exist');
        }
        this.sessions.splice(this.sessions.indexOf(originalSession), 1);
        await this.dataIo.setData(this.sessions)
            .catch(() => {
            this.sessions.push(originalSession);
            throw new Error('fail to save session delete request');
        });
    }
}
exports.SessionsDal = SessionsDal;
exports.SessionsDalSingelton = new SessionsDal(new dataIO_1.DataIO(SESSION_FILE_NAME));
//# sourceMappingURL=sessionsDal.js.map