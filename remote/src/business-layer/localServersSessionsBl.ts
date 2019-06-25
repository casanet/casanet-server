import * as cryptoJs from 'crypto-js';
import { Request, Response } from 'express';
import * as randomstring from 'randomstring';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
import { LocalServersSessionsDal, LocalServersSessionsDalSingleton } from '../data/localServersSessionsDal';
import { LocalServerSession } from '../models/remoteInterfaces';
import { LocalServersBl, LocalServersBlSingleton } from './localServersBl';
import { Configuration } from '../../../backend/src/config';

export class LocalServersSessionsBl {

    constructor(private localServersSessionsDal: LocalServersSessionsDal, private localServerBl: LocalServersBl) {
    }

    /**
     * Get local server cert session.
     * @param localServerId local server to get session for
     * @returns local server cert session.
     */
    public async getlocalServerSession(localServerId: string): Promise<LocalServerSession> {
        return await this.localServersSessionsDal.getLocalServerSessions(localServerId);
    }

    /**
     * Generate cert key for local server.
     * @param localServerId local server to generate for.
     * @returns key in *plain text*.
     */
    public async generateLocalServerSession(localServerId: string): Promise<string> {
        /** Make sure that there is valid local server */
        await this.localServerBl.getlocalServersById(localServerId);

        /** remove old session if exsit. */
        try {
            await this.localServersSessionsDal.deleteLocalServerSession(localServerId);
        } catch (error) {

        }

        /** Generate key */
        const sessionKey = randomstring.generate(64);

        /**
         * Hash it to save only hash and *not* key plain text
         */
        const keyHash = cryptoJs.SHA512(sessionKey + Configuration.keysHandling.saltHash).toString();
        /** Create session object */
        const localServerSession: LocalServerSession = {
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
    public async deleteLocalServerSession(localServerId: string): Promise<void> {

        return await this.localServersSessionsDal.deleteLocalServerSession(localServerId);
    }
}

export const LocalServersSessionBlSingleton = new LocalServersSessionsBl(LocalServersSessionsDalSingleton, LocalServersBlSingleton);
