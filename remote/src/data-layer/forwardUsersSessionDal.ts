import { DataIO } from '../../../backend/src/data-layer/dataIO';
import { IDataIO } from '../../../backend/src/models/backendInterfaces';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
import { ForwardUserSession, LocalServerSession } from '../models/remoteInterfaces';

const USERS_SESSION_FILE_NAME = 'usersSession.json';

export class ForwardUsersSessionsDal {

    /** Forward users sessions array */
    private forwardUersSessions: ForwardUserSession[];

    constructor(private dataIo: IDataIO) {
        this.forwardUersSessions = dataIo.getDataSync();
    }

    /**
     * Find session by session key hash.
     * @param sessionKeyHash session key hash.
     * @returns Session object or undefined if not exist.
     */
    private findUserSession(sessionKeyHash: string): ForwardUserSession {
        for (const session of this.forwardUersSessions) {
            if (session.sessionKeyHash === sessionKeyHash) {
                return session;
            }
        }
    }

    /**
     * Get forward users sessions.
     */
    public async getForwardUsersSessions(): Promise<ForwardUserSession[]> {
        return this.forwardUersSessions;
    }

    /**
     * Get session by session key hash.
     * @param sessionKeyHash session key hash.
     * @returns Session object or undefined if not exist.
     */
    public async getUserSession(sessionKeyHash: string): Promise<ForwardUserSession> {
        const userSession = this.findUserSession(sessionKeyHash);

        if (!userSession) {
            throw new Error('user session not exist');
        }
        return userSession;
    }

    /**
     * Save new ForwardUserSession.
     */
    public async saveNewUserSession(userSession: ForwardUserSession): Promise<void> {
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
    public async deleteUserSession(sessionKeyHash: string): Promise<void> {
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

export const ForwardUsersSessionsDalSingleton = new ForwardUsersSessionsDal(new DataIO(USERS_SESSION_FILE_NAME));
