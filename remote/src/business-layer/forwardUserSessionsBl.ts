import * as cryptoJs from 'crypto-js';
import { Request, Response } from 'express';
import { ForwardUsersSessionsDal, ForwardUsersSessionsDalSingleton } from '../data-layer/forwardUsersSessionDal';
import { ForwardUserSession } from '../models/remoteInterfaces';

export class ForwardUsersSessionsBl {

    /**
     *
     * @param usersSessionsDal inject user session dal.
     */
    constructor(private usersSessionsDal: ForwardUsersSessionsDal) {
    }

    /**
     * Gets session by session key, or reject if not exist.
     * @param sessionKey session key
     * @returns session, or inject if not exist.
     */
    public async getSession(sessionKey: string): Promise<ForwardUserSession> {
        const hashedSession = cryptoJs.SHA256(sessionKey).toString();
        return await this.usersSessionsDal.getUserSession(hashedSession);
    }

    /**
     * Create/save forward user session.
     * @param localServerId local server to generate session for.
     * @param sessionKey session key in plain text.
     */
    public async createNewSession(localServerId: string, sessionKey: string): Promise<void> {
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
    public async deleteSession(forwardUserSession: ForwardUserSession): Promise<void> {
        return this.usersSessionsDal.deleteUserSession(forwardUserSession.sessionKeyHash);
    }
}

export const ForwardUsersSessionsBlSingleton = new ForwardUsersSessionsBl(ForwardUsersSessionsDalSingleton);
