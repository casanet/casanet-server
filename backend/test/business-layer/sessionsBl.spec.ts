import * as chai from 'chai';
import { assert, expect } from 'chai';
import { SessionsBl } from '../../src/business-layer/sessionsBl';
import { SessionsDal } from '../../src/data-layer/sessionsDal';
import { Session } from '../../src/models/backendInterfaces';
import { ErrorResponse, User } from '../../src/models/sharedInterfaces';
import * as cryptoJs from 'crypto-js';

class SessionsDalMock {

    public mockSessions: Session[] = [
        {
            keyHash: '1234',
            timeStump: new Date().getTime(),
            email: 'aa@bb.com',
        },
        {
            keyHash: '12345',
            timeStump: 300,
            email: 'aa@bb.com',
        },
        {
            keyHash: '1234',
            timeStump: new Date().getTime(),
            email: 'aaa@bb.com',
        },
        {
            keyHash: '123456',
            timeStump: new Date().getTime() - 1000,
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

const sessionDalMock = new SessionsDalMock();
const sessionBl = new SessionsBl(sessionDalMock as unknown as SessionsDal);

describe('Sesssion BL tests', () => {

    describe('Get Session', () => {
        it('it should get session succsessfully', async () => {

            const key = '543583bfngfnds45453535256524';
            sessionDalMock.mockSessions[2].keyHash = cryptoJs.SHA256(key).toString();
            const session = await sessionBl.getSession(key);

            expect(session).to.deep.equal(sessionDalMock.mockSessions[2]);
            return;
        });

        it('it should get nothing for empty session', async () => {

            try {
                await sessionBl.getSession('');
            } catch (error) {
                return;
            }

            throw new Error('get empty session should fail');
        });

        it('it should get nothing for undefined session', async () => {

            try {
                await sessionBl.getSession(undefined);
            } catch (error) {
                return;
            }

            throw new Error('get undefined session should fail');
        });
    });

    describe('Get User Sessions', () => {
        it('it should get sessions succsessfully', async () => {

            const userToGetFor: User = {
                email: sessionDalMock.mockSessions[0].email,
                displayName: '',
                ignoreTfa: true,
                password: 'ffd',
                sessionTimeOutMS: 1000000,
                scope: 'userAuth',
            };
            const sessions = await sessionBl.getUserSessions(userToGetFor);

            expect(sessions).to.be.a('array');
            expect(sessions).to.be.an('array').that.is.length(2);
            return;
        });
    });

    describe('Generate Session', () => {
        it('it should create session succsessfully', async () => {

            const session = await sessionBl.generateSession({
                email: sessionDalMock.mockSessions[2].email,
                displayName: '',
                ignoreTfa: true,
                password: 'ffd',
                sessionTimeOutMS: 1000000,
                scope: 'userAuth',
            });

            expect(session).to.be.a('string').length.above(60);
            expect(sessionDalMock.mockSessions).length(5);
            return;
        });
    });

    describe('Delete Session', () => {
        it('it should delete session succsessfully', async () => {

            await sessionBl.deleteSession(sessionDalMock.mockSessions[2]);

            expect(sessionDalMock.mockSessions).length(4);
            return;
        });
    });
});
