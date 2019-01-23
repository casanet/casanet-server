import * as chai from 'chai';
import { assert, expect } from 'chai';
import { Configuration } from '../../src/config';
import { SessionsDal } from '../../src/data-layer/sessionsDal';
import { IDataIO, Session } from '../../src/models/backendInterfaces';
import { logger } from '../../src/utilities/logger';

class DataIOMock implements IDataIO {

    public mockData: Session[] = [
        {
            email: 'aa.bb@cc.com',
            keyHash: '42343243938389343984843546574682746784346327843687324',
            timeStamp: 34555435354354,
        },
        {
            email: 'aa@bb.com',
            keyHash: '9875415248941652413541321',
            timeStamp: 7777888888,
        },
    ];

    public getDataSync(): any[] {
        return this.mockData;
    }

    public async getData(): Promise<any[]> {
        return this.mockData;
    }

    public async setData(data: any[]): Promise<void> {
        this.mockData = data;
    }
}

const dataMock = new DataIOMock();
const sessionsDal = new SessionsDal(dataMock);

describe('Sesssion DAL tests', () => {

    describe('Get Sessions', () => {
        it('it should get sessions succsessfully', async () => {

            const sessions = await sessionsDal.getSessions();
            expect(sessions).to.deep.equal(dataMock.mockData);
            return;
        });
    });

    describe('Get Session by key', () => {
        it('it should get session succsessfully', async () => {

            const session = await sessionsDal.getSession(dataMock.mockData[1].keyHash);

            expect(session).to.deep.equal(dataMock.mockData[1]);
            return;
        });
    });

    const additionalSession: Session = {
        email: 'aa.bb@cc.com',
        keyHash: '0987123',
        timeStamp: new Date().getTime(),
    };

    describe('Create new session', () => {
        it('it should create session succsessfully', async () => {

            await sessionsDal.createSession(additionalSession);

            const session = await sessionsDal.getSession(additionalSession.keyHash);

            expect(session).to.deep.equal(additionalSession);
            return;
        });
    });

    describe('Delete session', () => {
        it('it should delete session succsessfully', async () => {

            await sessionsDal.deleteSession(additionalSession);

            const sessions = await sessionsDal.getSessions();

            expect(sessions).to.have.length(dataMock.mockData.length);
            return;
        });
    });
});
