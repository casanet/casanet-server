"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cryptoJs = require("crypto-js");
const randomstring = require("randomstring");
const localServersSessionsDal_1 = require("../data-layer/localServersSessionsDal");
const localServersBl_1 = require("./localServersBl");
class LocalServersSessionsBl {
    constructor(localServersSessionsDal, localServerBl) {
        this.localServersSessionsDal = localServersSessionsDal;
        this.localServerBl = localServerBl;
    }
    /**
     * Get local server cert session.
     * @param localServerId local server to get session for
     * @returns local server cert session.
     */
    async getlocalServerSession(localServerId) {
        return await this.localServersSessionsDal.getLocalServerSessions(localServerId);
    }
    /**
     * Generate cert key for local server.
     * @param localServerId local server to generate for.
     * @returns key in *plain text*.
     */
    async generateLocalServerSession(localServerId) {
        /** Make sure that there is valid local server */
        await this.localServerBl.getlocalServersById(localServerId);
        /** remove old session if exsit. */
        try {
            await this.localServersSessionsDal.deleteLocalServerSession(localServerId);
        }
        catch (error) {
        }
        /** Generate key */
        const sessionKey = randomstring.generate(64);
        /**
         * Hash it to save only hash and *not* key plain text
         */
        const keyHash = cryptoJs.SHA256(sessionKey).toString();
        /** Create session object */
        const localServerSession = {
            localServerId,
            keyHash,
        };
        /** Save session */
        await this.localServersSessionsDal.createLocalServerSession(localServerSession);
        /** Return generated key in plain text */
        return sessionKey;
    }
    /**
     * Remove local server session cert.
     * @param localServerId local server to remove session for.
     */
    async deleteLocalServerSession(localServerId) {
        return await this.localServersSessionsDal.deleteLocalServerSession(localServerId);
    }
}
exports.LocalServersSessionsBl = LocalServersSessionsBl;
exports.LocalServersSessionBlSingleton = new LocalServersSessionsBl(localServersSessionsDal_1.LocalServersSessionsDalSingleton, localServersBl_1.LocalServersBlSingleton);
//# sourceMappingURL=localServersSessionsBl.js.map