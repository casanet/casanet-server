import { IDataIO } from '../models/backendInterfaces';
import { LocalNetworkDevice, User } from '../models/sharedInterfaces';
import { DataIO } from './dataIO';

const DEVICES_FILE_NAME = 'devices.json';

/**
 * Used only to save devices name map to mac address. not any other use.
 */
export class DevicesDal {

    private dataIo: IDataIO;

    /**
     * Kept Devices.
     */
    private devices: LocalNetworkDevice[] = [];

    constructor(dataIo: IDataIO) {
        this.dataIo = dataIo;

        this.devices = dataIo.getDataSync();
    }

    /**
     * Find device in devices array
     */
    private findDevice(mac: string): LocalNetworkDevice {
        for (const device of this.devices) {
            if (device.mac === mac) {
                return device;
            }
        }
    }

    /**
     * Get all saved devices as array.
     */
    public async getDevices(): Promise<LocalNetworkDevice[]> {
        return this.devices;
    }

    /**
     * Save new device mac name map.
     */
    public async saveDevice(deviceToSave: LocalNetworkDevice): Promise<void> {

        const originalDevice = this.findDevice(deviceToSave.mac);

        if (originalDevice) {
            this.devices.splice(this.devices.indexOf(originalDevice), 1);
        }

        this.devices.push(deviceToSave);

        await this.dataIo.setData(this.devices)
            .catch(() => {
                this.devices.splice(this.devices.indexOf(deviceToSave), 1);

                if (originalDevice) {
                    this.devices.push(originalDevice);
                }

                throw new Error('fail to save device');
            });
    }

    /**
     * Remove device name map.
     */
    public async removeDevice(deviceToRemove: LocalNetworkDevice): Promise<void> {
        const originalDevice = this.findDevice(deviceToRemove.mac);

        if (!originalDevice) {
            throw new Error('device not saved');
        }

        this.devices.splice(this.devices.indexOf(originalDevice), 1);
        await this.dataIo.setData(this.devices)
            .catch(() => {
                this.devices.push(originalDevice);
                throw new Error('fail to save device removed request');
            });
    }
}

export const DevicesDalSingleton = new DevicesDal(new DataIO(DEVICES_FILE_NAME));
