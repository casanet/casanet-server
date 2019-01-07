import { Request, Response } from 'express';
import * as randomstring from 'randomstring';
import { Configuration } from '../config';
import { SessionsDal, SessionsDalSingelton } from '../data-layer/sessionsDal';
import { Session } from '../models/backendInterfaces';
import { User } from '../models/sharedInterfaces';

export class SessionsBl {

    private sessionDal: SessionsDal;

    /**
     * Init session bl. using dependecy injection pattern to allow units testings.
     * @param sessionDal Inject the dal instalce.
     */
    constructor(sessionDal: SessionsDal) {

        this.sessionDal = sessionDal;
    }

    /**
     * Gets session by session ky, or reject if not exist.
     * @param sessionKey session key
     * @returns session, or inject if not exist.
     */
    public async getSession(sessionKey: string): Promise<Session> {
        return this.sessionDal.getSession(sessionKey);
    }

    /**
     * Get all user sessions.
     * @param user User to get session for.
     * @returns Session array.
     */
    public async getUserSessions(user: User): Promise<Session[]> {

        const sessions: Session[] = await this.sessionDal.getSessions();

        const userSessions: Session[] = [];
        for (const session of sessions) {
            if (session.email === user.email && (new Date().getTime() - session.timeStump) < user.sessionTimeOutMS) {
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
    public async generateSession(userToCreateFor: User): Promise<Session> {
        const newSession: Session = {
            key: randomstring.generate(64),
            timeStump: new Date().getTime(),
            email: userToCreateFor.email,
        };

        await this.sessionDal.createSession(newSession);

        return newSession;
    }

    /**
     * Delete session.
     * @param session session to selete.
     */
    public async deleteSession(session: Session): Promise<void> {
        return this.sessionDal.deleteSession(session);
    }
}

export const SessionsBlSingleton = new SessionsBl(SessionsDalSingelton);
