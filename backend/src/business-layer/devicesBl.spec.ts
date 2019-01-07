import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { DevicesDal } from '../data-layer/devicesDal';
import { DeviceKind, ErrorResponse, LocalNetworkDevice, Minion, MinionStatus, User } from '../models/sharedInterfaces';
import { ModulesManager } from '../modules/modulesManager';
import { Delay } from '../utilities/sleep';
import { DevicesBl } from './devicesBl';

const localNetworkDevicesMock: LocalNetworkDevice[] = [
    {
        mac: '1111111111',
        ip: '192.168.1.1',
    },
    {
        mac: '22222222222',
        ip: '192.168.1.2',
        vendor: 'bla bla brand name',

    },
    {
        mac: '33333333333',
        ip: '192.168.1.3',
    },
];

const localNetworkReaderMock = async (): Promise<LocalNetworkDevice[]> => {

    await Delay(moment.duration(1, 'seconds'));
    return localNetworkDevicesMock;
};

class ModulesManagerMock {

    /**
     * Let subscribe to any status minion changed. from any brand module.
     */
    public minionStatusChangedEvent = new BehaviorSubject<{
        mac: string;
        status: MinionStatus;
    }>({
        mac: '',
        status: undefined,
    });

    public get devicesKind(): DeviceKind[] {
        return [
            {
                brand: 'test mock',
                isTokenRequierd: false,
                isUsedAsLogicDevice: false,
                model: 'switch demo',
                suppotedMinionType: 'switch',
            },
            {
                brand: 'test mock',
                isTokenRequierd: false,
                isUsedAsLogicDevice: true,
                model: 'ac demo',
                suppotedMinionType: 'airConditioning',
            },
        ];
    }

    public async getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
        await Delay(moment.duration(1, 'seconds'));
        if (miniom.device.model === 'switch demo') {
            return {
                switch: {
                    status: 'on',
                },
            };
        } else if (miniom.device.model === 'ac demo') {
            return {
                airConditioning: {
                    fanStrength: 'med',
                    mode: 'cold',
                    status: 'on',
                    temperature: 21,
                },
            };
        }
        throw {
            code: 4005,
            message: 'unknown model',
        } as ErrorResponse;
    }

    public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.
        return;
    }
}

// tslint:disable-next-line:max-classes-per-file
class DevicesDalMock {

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

const devicesDalMock = new DevicesDalMock();
const modulesManagerMock = new ModulesManagerMock();
const devicesBl = new DevicesBl(devicesDalMock as unknown as DevicesDal,
    localNetworkReaderMock,
    modulesManagerMock as unknown as ModulesManager);

describe('Devices BL tests', () => {

    describe('Get local devices', () => {
        it('it should get devices succsessfully', async () => {

            /**
             * Allow logic to finish devices scan.
             */
            await Delay(moment.duration(2, 'seconds'));

            const devices = await devicesBl.getDevices();

            expect(devices).length(localNetworkDevicesMock.length);

            return;
        }).timeout(moment.duration(2.5, 'seconds').asMilliseconds());

        it('it should load names succsessfully', async () => {

            const devices = await devicesBl.getDevices();

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

            await devicesBl.setDeviceName(localDevices);

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

            await devicesBl.rescanNetwork();

            const devices = await devicesBl.getDevices();

            expect(devices).length(localNetworkDevicesMock.length);
            expect(devices).to.include(newNetworkDevice);
        });
    });

    describe('Get system devices kinds', () => {
        it('it should get devices succsessfully', async () => {

            const devicesKinds = await devicesBl.getDevicesKins();

            expect(devicesKinds).to.be.deep.equal(modulesManagerMock.devicesKind);
        });
    });
});
