"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cryptoJs = require("crypto-js");
const config_1 = require("../../../backend/src/config");
const deepCopy_1 = require("../../../backend/src/utilities/deepCopy");
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
        const hashedSession = cryptoJs.SHA512(sessionKey + config_1.Configuration.keysHandling.saltHash).toString();
        return await this.usersSessionsDal.getUserSession(hashedSession);
    }
    /**
     * Create/save forward user session.
     * @param localServerId local server to generate session for.
     * @param sessionKey session key in plain text.
     * @param authenticatedUser user that current session belong to.
     */
    async createNewSession(localServerId, sessionKey, authenticatedUser) {
        /** Never save plain text key. */
        const sessionKeyHash = cryptoJs.SHA512(sessionKey + config_1.Configuration.keysHandling.saltHash).toString();
        /** save session. */
        await this.usersSessionsDal.saveNewUserSession({
            localServerId,
            sessionKeyHash,
            authenticatedUser,
        });
    }
    /**
     * Delete forward user session.
     * @param forwardUserSession session to delete.
     */
    async deleteSession(forwardUserSession) {
        return this.usersSessionsDal.deleteUserSession(forwardUserSession.sessionKeyHash);
    }
    /**
     * Remove all user sessions.
     * @param user user to throw out his sessions.
     */
    async deleteUserSessions(user) {
        const sessionsCopy = deepCopy_1.DeepCopy(await this.usersSessionsDal.getForwardUsersSessions());
        for (const session of sessionsCopy) {
            if (session.authenticatedUser === user) {
                await this.usersSessionsDal.deleteUserSession(session.sessionKeyHash);
            }
        }
    }
}
exports.ForwardUsersSessionsBl = ForwardUsersSessionsBl;
exports.ForwardUsersSessionsBlSingleton = new ForwardUsersSessionsBl(forwardUsersSessionDal_1.ForwardUsersSessionsDalSingleton);
//# sourceMappingURL=forwardUserSessionsBl.js.map