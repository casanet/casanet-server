import { IDataIO, Session } from '../models/backendInterfaces';
import { DataIO } from './dataIO';

const SESSION_FILE_NAME = 'sessions';

export class SessionsDal {

    private dataIo: IDataIO;

    /**
     * Sessions.
     */
    private sessions: Session[] = [];

    constructor(dataIo: IDataIO) {
        this.dataIo = dataIo;

        this.sessions = dataIo.getDataSync();
    }

    /**
     * Find sessin in session array
     */
    private findSession(key: string): Session {
        for (const session of this.sessions) {
            if (session.keyHash === key) {
                return session;
            }
        }
    }

    /**
     * Get all session as array.
     */
    public async getSessions(): Promise<Session[]> {
        return this.sessions;
    }

    /**
     * Get session by session key.
     * @param key Find session by key.
     */
    public async getSession(key: string): Promise<Session> {
        const session = this.findSession(key);

        if (!session) {
            throw new Error('sessin not exist');
        }
        return session;
    }

    /**
     * Save new session.
     */
    public async createSession(newSession: Session): Promise<void> {
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
    public async deleteSession(session: Session): Promise<void> {
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

export const SessionsDalSingelton = new SessionsDal(new DataIO(SESSION_FILE_NAME));
