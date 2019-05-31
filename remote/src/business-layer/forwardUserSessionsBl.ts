import * as cryptoJs from 'crypto-js';
import { Request, Response } from 'express';
import { Configuration } from '../../../backend/src/config';
import { DeepCopy } from '../../../backend/src/utilities/deepCopy';
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
        const hashedSession = cryptoJs.SHA512(sessionKey + Configuration.keysHandling.saltHash).toString();
        return await this.usersSessionsDal.getUserSession(hashedSession);
    }

    /**
     * Create/save forward user session.
     * @param localServerId local server to generate session for.
     * @param sessionKey session key in plain text.
     * @param authenticatedUser user that current session belong to.
     */
    public async createNewSession(localServerId: string, sessionKey: string, authenticatedUser: string): Promise<void> {
        /** Never save plain text key. */
        const sessionKeyHash = cryptoJs.SHA512(sessionKey + Configuration.keysHandling.saltHash).toString();
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
    public async deleteSession(forwardUserSession: ForwardUserSession): Promise<void> {
        return this.usersSessionsDal.deleteUserSession(forwardUserSession.sessionKeyHash);
    }

    /**
     * Remove all user sessions.
     * @param user user to throw out his sessions.
     */
    public async deleteUserSessions(user: string): Promise<void> {
        const sessionsCopy = DeepCopy<ForwardUserSession[]>(await this.usersSessionsDal.getForwardUsersSessions());
        for (const session of sessionsCopy) {
            if (session.authenticatedUser === user) {
                await this.usersSessionsDal.deleteUserSession(session.sessionKeyHash);
            }
        }
    }
}

export const ForwardUsersSessionsBlSingleton = new ForwardUsersSessionsBl(ForwardUsersSessionsDalSingleton);
