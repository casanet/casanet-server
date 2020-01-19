import { LocalNetworkDevice } from '../../../src/models/sharedInterfaces';

export class DevicesDalMock {
  public mockDevicesNamesMap: LocalNetworkDevice[] = [
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
    {
      name: 'IR transmitter',
      mac: 'ac12345432',
    },
  ];

  private findDevice(mac: string): LocalNetworkDevice {
    for (const device of this.mockDevicesNamesMap) {
      if (device.mac === mac) {
        return device;
      }
    }
  }

  public async getDevices(): Promise<LocalNetworkDevice[]> {
    return this.mockDevicesNamesMap;
  }

  public async saveDevice(deviceToSave: LocalNetworkDevice): Promise<void> {
    const originalDevice = this.findDevice(deviceToSave.mac);

    if (originalDevice) {
      this.mockDevicesNamesMap.splice(this.mockDevicesNamesMap.indexOf(originalDevice), 1);
    }

    this.mockDevicesNamesMap.push(deviceToSave);
  }

  public async removeDevice(deviceToRemove: LocalNetworkDevice): Promise<void> {
    const originalDevice = this.findDevice(deviceToRemove.mac);

    if (!originalDevice) {
      throw new Error('device not saved');
    }

    this.mockDevicesNamesMap.splice(this.mockDevicesNamesMap.indexOf(originalDevice), 1);
  }
}
