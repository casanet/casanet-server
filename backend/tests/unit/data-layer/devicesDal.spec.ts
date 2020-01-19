import * as chai from 'chai';
import { assert, expect } from 'chai';
import { DevicesDal } from '../../../src/data-layer/devicesDal';
import { IDataIO, Session } from '../../../src/models/backendInterfaces';
import { LocalNetworkDevice, User } from '../../../src/models/sharedInterfaces';
import { DeepCopy } from '../../../src/utilities/deepCopy';

class DataIOMock implements IDataIO {
  public mockData: LocalNetworkDevice[] = [
    {
      name: 'first',
      mac: '1111111111',
    },
    {
      name: 'second',
      mac: '22222222222',
    },
    {
      name: 'third',
      mac: '33333333333',
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
const devicesDal = new DevicesDal(dataMock);

describe('Devices DAL tests', () => {
  describe('Get devices names', () => {
    it('it should get devices succsessfully', async () => {
      const users = await devicesDal.getDevices();

      expect(users).to.deep.equal(dataMock.mockData);
      return;
    });
  });

  describe('Set new name to exist device', () => {
    it('it should set name succsessfully', async () => {
      const device: LocalNetworkDevice = DeepCopy<LocalNetworkDevice>(dataMock.mockData[1]);
      device.name = 'new name';
      await devicesDal.saveDevice(device);

      expect(dataMock.mockData).length(3);
    });
  });

  const additionalDevice: LocalNetworkDevice = {
    mac: '44444444',
    name: 'fourth',
  };

  describe('Set new name to not exist device', () => {
    it('it should set name succsessfully', async () => {
      await devicesDal.saveDevice(additionalDevice);

      expect(dataMock.mockData).length(4);
    });
  });

  describe('Remove device name map', () => {
    it('it should delete name map succsessfully', async () => {
      await devicesDal.removeDevice(additionalDevice);

      expect(dataMock.mockData).length(3);
    });
  });
});
