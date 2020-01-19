"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cryptoJs = require("crypto-js");
const randomstring = require("randomstring");
const config_1 = require("../config");
const sessionsDal_1 = require("../data-layer/sessionsDal");
const authBl_1 = require("./authBl");
class SessionsBl {
    /**
     * Init session bl. using dependecy injection pattern to allow units testings.
     * @param sessionDal Inject the dal instance.
     */
    constructor(sessionDal) {
        this.sessionDal = sessionDal;
    }
    /**
     * Gets session by session key, or reject if not exist.
     * @param sessionKey session key
     * @returns session, or inject if not exist.
     */
    async getSession(sessionKey) {
        const hashedSession = cryptoJs.SHA512(sessionKey + config_1.Configuration.keysHandling.saltHash).toString();
        return await this.sessionDal.getSession(hashedSession); // TODO unit test?
    }
    /**
     * Get all user sessions.
     * @param user User to get session for.
     * @returns Session array.
     */
    async getUserSessions(user) {
        const sessions = await this.sessionDal.getSessions();
        const userSessions = [];
        for (const session of sessions) {
            if (session.email === user.email && new Date().getTime() - session.timeStamp < authBl_1.sessionExpiresMs) {
                userSessions.push(session);
            }
        }
        return userSessions;
    }
    /**
     * Generate session for user.
     * @param userToCreateFor User to create session for.
     * @returns The new generated session.
     */
    async generateSession(userToCreateFor) {
        const generatedSession = randomstring.generate(64);
        const newSession = {
            keyHash: cryptoJs.SHA512(generatedSession + config_1.Configuration.keysHandling.saltHash).toString(),
            timeStamp: new Date().getTime(),
            email: userToCreateFor.email,
        };
        await this.sessionDal.createSession(newSession);
        return generatedSession;
    }
    /**
     * Delete session.
     * @param session session to selete.
     */
    async deleteSession(session) {
        return this.sessionDal.deleteSession(session);
    }
    /**
     * Delete all user session .
     * @param user user to delete all activated sessions.
     */
    async deleteUserSessions(user) {
        const sessions = await this.getUserSessions(user);
        for (const session of sessions) {
            await this.deleteSession(session);
        }
    }
}
exports.SessionsBl = SessionsBl;
exports.SessionsBlSingleton = new SessionsBl(sessionsDal_1.SessionsDalSingelton);
//# sourceMappingURL=sessionsBl.js.map