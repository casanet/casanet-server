"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cryptoJs = require("crypto-js");
const forwardUsersSessionDal_1 = require("../data-layer/forwardUsersSessionDal");
class ForwardUsersSessionsBl {
    /**
     *
     * @param usersSessionsDal inject user session dal.
     */
    constructor(usersSessionsDal) {
        this.usersSessionsDal = usersSessionsDal;
    }
    /**
     * Gets session by session key, or reject if not exist.
     * @param sessionKey session key
     * @returns session, or inject if not exist.
     */
    async getSession(sessionKey) {
        const hashedSession = cryptoJs.SHA256(sessionKey).toString();
        return await this.usersSessionsDal.getUserSession(hashedSession);
    }
    /**
     * Create/save forward user session.
     * @param localServerId local server to generate session for.
     * @param sessionKey session key in plain text.
     */
    async createNewSession(localServerId, sessionKey) {
        /** Never save plain text key. */
        const sessionKeyHash = cryptoJs.SHA256(sessionKey).toString();
        /** save session. */
        await this.usersSessionsDal.saveNewUserSession({
            localServerId,
            sessionKeyHash,
        });
    }
    /**
     * Delete forward user session.
     * @param forwardUserSession session to delete.
     */
    async deleteSession(forwardUserSession) {
        return this.usersSessionsDal.deleteUserSession(forwardUserSession.sessionKeyHash);
    }
}
exports.ForwardUsersSessionsBl = ForwardUsersSessionsBl;
exports.ForwardUsersSessionsBlSingleton = new ForwardUsersSessionsBl(forwardUsersSessionDal_1.ForwardUsersSessionsDalSingleton);
//# sourceMappingURL=forwardUserSessionsBl.js.map