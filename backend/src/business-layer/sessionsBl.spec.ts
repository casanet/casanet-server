import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as express from 'express';
import { ISessionDataLayer, Session } from '../models/backendInterfaces';
import { ErrorResponse, User } from '../models/sharedInterfaces';
import { SessionsBl } from './sessionsBl';

class SessionsDalMock implements ISessionDataLayer {

    public mockSessions: Session[] = [
        {
            key: '1234',
            timeStump: new Date().getTime(),
            email: 'aa@bb.com',
        },
        {
            key: '12345',
            timeStump: 300,
            email: 'aa@bb.com',
        },
        {
            key: '1234',
            timeStump: new Date().getTime(),
            email: 'aaa@bb.com',
        },
        {
            key: '123456',
            timeStump: new Date().getTime() - 1000,
            email: 'aa@bb.com',
        },
    ];

    public async getSessions(): Promise<Session[]> {
        return this.mockSessions;
    }

    public async getSession(email: string): Promise<Session> {
        for (const session of this.mockSessions) {
            if (session.email === email) {
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
const sessionBl = new SessionsBl(sessionDalMock);

describe('Sesssion BL tests', () => {

    describe('Get Session', () => {
        it('it should get session succsessfully', async () => {

            const session = await sessionBl.getSession(sessionDalMock.mockSessions[2].email);

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
                firstName: '',
                ignoreTfa: true,
                password: 'ffd',
                sessionTimeOutMS: 1000000,
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
                firstName: '',
                ignoreTfa: true,
                password: 'ffd',
                sessionTimeOutMS: 1000000,
            });

            expect(session).to.be.a('object');
            expect(session).to.have.property('email', sessionDalMock.mockSessions[2].email);
            expect(session).to.have.property('timeStump');
            expect(session).to.have.property('key').to.be.a('string').length.above(60);
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
