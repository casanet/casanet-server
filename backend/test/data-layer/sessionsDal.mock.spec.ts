
import { Session } from '../../src/models/backendInterfaces';

export class SessionsDalMock {

    public mockSessions: Session[] = [
        {
            keyHash: '1234',
            timeStamp: new Date().getTime(),
            email: 'aa@bb.com',
        },
        {
            keyHash: '12345',
            timeStamp: 300,
            email: 'aa@bb.com',
        },
        {
            keyHash: '1234',
            timeStamp: new Date().getTime(),
            email: 'aaa@bb.com',
        },
        {
            keyHash: '123456',
            timeStamp: new Date().getTime() - 1000,
            email: 'aa@bb.com',
        },
    ];

    public async getSessions(): Promise<Session[]> {
        return this.mockSessions;
    }

    public async getSession(key: string): Promise<Session> {
        for (const session of this.mockSessions) {
            if (session.keyHash === key) {
                return session;
            }
        }
        throw new Error('not exsit');
    }

    public async createSession(newSession: Session): Promise<void> {
        this.mockSessions.push(newSession);
    }

    public async deleteSession(session: Session): Promise<void> {
        this.mockSessions.splice(this.mockSessions.indexOf(session), 1);
    }
}
