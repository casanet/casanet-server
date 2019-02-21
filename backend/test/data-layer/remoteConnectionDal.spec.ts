import * as chai from 'chai';
import { assert, expect } from 'chai';
import { Configuration } from '../../src/config';
import { RemoteConnectionDal } from '../../src/data-layer/remoteConnectionDal';
import { IDataIO, Session } from '../../src/models/backendInterfaces';
import { RemoteSettings } from '../../src/models/sharedInterfaces';
import { logger } from '../../src/utilities/logger';

class DataIOMock implements IDataIO {

    public mockData: RemoteSettings[] = [
        {
            connectionKey: 'gggg',
            host: 'localhost',
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
const remoteConnectionDal = new RemoteConnectionDal(dataMock);

describe('Remote connection DAL tests', () => {

    describe('Get remote connection', () => {
        it('it should get remote connection succsessfully', async () => {

            const remoteSettings = await remoteConnectionDal.getRemoteSettings();
            expect(remoteSettings).to.deep.equal(dataMock.mockData[0]);
            return;
        });
    });

    describe('Delete remote connection', () => {
        it('it should delete remote connection session succsessfully', async () => {

            await remoteConnectionDal.deleteRemoteSettings();

            expect(dataMock.mockData.length).to.deep.equal(0);
            return;
        });
    });

    const newRemoteSettings: RemoteSettings = {
        host: '127.0.0.1',
        connectionKey: '123',
    };

    const secondNewRemoteSettings: RemoteSettings = {
        host: 'localhost',
        connectionKey: '123456789',
    };

    describe('Set new remote settings', () => {
        it('it should set remote settings succsessfully', async () => {

            await remoteConnectionDal.setRemoteSettings(newRemoteSettings);

            expect(dataMock.mockData.length).to.deep.equal(1);
            return;
        });

        it('it should set second remote settings succsessfully', async () => {

            await remoteConnectionDal.setRemoteSettings(secondNewRemoteSettings);

            expect(dataMock.mockData.length).to.deep.equal(1);
            return;
        });
    });

    describe('Get last new remote connection', () => {
        it('it should get last remote settings succsessfully', async () => {

            const remoteSettings = await remoteConnectionDal.getRemoteSettings();
            expect(remoteSettings).to.deep.equal(secondNewRemoteSettings);
            return;
        });
    });
});
