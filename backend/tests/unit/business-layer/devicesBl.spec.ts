import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { DevicesBl } from '../../../src/business-layer/devicesBl';
import { DevicesDal } from '../../../src/data-layer/devicesDal';
import {
  DeviceKind,
  ErrorResponse,
  LocalNetworkDevice,
  Minion,
  MinionStatus,
  User,
} from '../../../src/models/sharedInterfaces';
import { ModulesManager } from '../../../src/modules/modulesManager';
import { Delay } from '../../../src/utilities/sleep';
import { DevicesDalMock } from '../data-layer/devicesDal.mock.spec';
import { ModulesManagerMock } from '../modules/modulesManager.mock.spec';
import { localNetworkDevicesMock, localNetworkReaderMock } from '../utilities/lanManager.mock.spec';

const devicesDalMock = new DevicesDalMock();
const modulesManagerMock = new ModulesManagerMock();

const devicesBlMock = new DevicesBl(
  (devicesDalMock as unknown) as DevicesDal,
  localNetworkReaderMock,
  (modulesManagerMock as unknown) as ModulesManager,
);

describe('Devices BL tests', () => {
  describe('Get local devices', () => {
    it('it should get devices succsessfully', async () => {
      /**
       * Befor getting any device, needs to scan network.
       */
      await devicesBlMock.rescanNetwork();

      const devices = await devicesBlMock.getDevices();

      expect(devices).length(localNetworkDevicesMock.length);

      return;
    }).timeout(moment.duration(2.5, 'seconds').asMilliseconds());

    it('it should load names successfully', async () => {
      const devices = await devicesBlMock.getDevices();

      const localDevices: LocalNetworkDevice = {
        mac: '22222222222',
        ip: '192.168.1.2',
        vendor: 'bla bla brand name',
        name: 'second',
      };
      expect(devices).to.deep.include(localDevices);
      return;
    });
  });

  describe('Set devices name', () => {
    it('it should set name succsessfully', async () => {
      const localDevices: LocalNetworkDevice = {
        mac: '22222222222',
        ip: '192.168.1.2',
        vendor: 'bla bla brand name',
        name: 'new second name',
      };

      await devicesBlMock.setDeviceName(localDevices);

      expect(devicesDalMock.mockDevicesNamesMap).to.deep.include(localDevices);
    });

    it('it should set name only succsessfully', async () => {
      const localDevices: LocalNetworkDevice = {
        mac: '22222222222',
        ip: '192.168.1.22',
        vendor: 'bla bla brand name',
        name: 'some other name',
      };

      await devicesBlMock.setDeviceName(localDevices);

      localDevices.ip = '192.168.1.2';

      expect(devicesDalMock.mockDevicesNamesMap).to.deep.include(localDevices);
      return;
    });
  });

  describe('Rescan network devices', () => {
    it('it should scan devices succsessfully', async () => {
      const newNetworkDevice: LocalNetworkDevice = {
        mac: '5555555',
        ip: '192.168.1.5',
        vendor: 'the new device',
      };
      localNetworkDevicesMock.push(newNetworkDevice);

      await devicesBlMock.rescanNetwork();

      const devices = await devicesBlMock.getDevices();

      expect(devices).length(localNetworkDevicesMock.length);
      expect(devices).to.include(newNetworkDevice);
    });
  });

  describe('Get system devices kinds', () => {
    it('it should get devices succsessfully', async () => {
      const devicesKinds = await devicesBlMock.getDevicesKins();

      expect(devicesKinds).to.be.deep.equal(modulesManagerMock.devicesKind);
    });
  });

  describe('Feed devices update', () => {
    it('it should update name changes', done => {
      const localDevices: LocalNetworkDevice = {
        mac: '22222222222',
        ip: '192.168.1.2',
        vendor: 'bla bla brand name',
        name: 'update to a new other name',
      };
      const detach = devicesBlMock.devicesUpdate.attach(devices => {
        if (!devices || devices.length < 1) {
          return;
        }

        for (const device of devices) {
          if (device.mac === localDevices.mac && device.name === localDevices.name) {
            detach();
            done();
            return;
          }
        }
      });

      Delay(moment.duration(1, 'seconds')).then(() => {
        devicesBlMock.setDeviceName(localDevices);
      });
    }).timeout(moment.duration(10, 'seconds').asMilliseconds());

    it('it should update devices network data changed', done => {
      const networkDevicesExpected = localNetworkDevicesMock[1];
      networkDevicesExpected.ip = '192.168.1.77';

      let specDone = false;
      const detach = devicesBlMock.devicesUpdate.attach(devices => {
        if (!devices || devices.length < 1) {
          return;
        }

        if (specDone) {
          if (detach) {
            detach();
          }
          return;
        }
        for (const device of devices) {
          if (networkDevicesExpected.mac === device.mac && networkDevicesExpected.ip === device.ip) {
            specDone = true;
            done();
            return;
          }
        }
      });

      Delay(moment.duration(1, 'seconds')).then(() => {
        devicesBlMock.rescanNetwork();
      });
    });
  });
});
