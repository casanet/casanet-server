import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { DevicesBl } from '../../src/business-layer/devicesBl';
import { DevicesDal } from '../../src/data-layer/devicesDal';
import { DeviceKind, ErrorResponse, LocalNetworkDevice, Minion, MinionStatus, User } from '../../src/models/sharedInterfaces';
import { ModulesManager } from '../../src/modules/modulesManager';
import { Delay } from '../../src/utilities/sleep';

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
    {
        mac: 'ac12345432',
        ip: '192.168.1.90',
    },
    {
        mac: '0987123ac',
        ip: '192.168.1.5',
    },
    {
        mac: '777777bb',
        ip: '192.168.1.55',
    },
    {
        mac: '777777cc',
        ip: '192.168.1.56',
    },
    {
        mac: '777777dd',
        ip: '192.168.1.57',
    },
    {
        mac: '777777ee',
        ip: '192.168.1.58',
        vendor : 'factory name',
    },
    {
        mac: '111111aa',
        ip: '192.168.1.59',
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
            responseCode: 4005,
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

const devicesDalMock = new DevicesDalMock();
const modulesManagerMock = new ModulesManagerMock();
export const DevicesBlMock = new DevicesBl(devicesDalMock as unknown as DevicesDal,
    localNetworkReaderMock,
    modulesManagerMock as unknown as ModulesManager);

describe('Devices BL tests', () => {

    describe('Get local devices', () => {
        it('it should get devices succsessfully', async () => {

            /**
             * Befor getting any device, needs to scan network.
             */
            await DevicesBlMock.rescanNetwork();

            const devices = await DevicesBlMock.getDevices();

            expect(devices).length(localNetworkDevicesMock.length);

            return;
        }).timeout(moment.duration(2.5, 'seconds').asMilliseconds());

        it('it should load names succsessfully', async () => {

            const devices = await DevicesBlMock.getDevices();

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

            await DevicesBlMock.setDeviceName(localDevices);

            expect(devicesDalMock.mockDevicesNamesMap).to.deep.include(localDevices);
        });

        it('it should set name only succsessfully', async () => {

            const localDevices: LocalNetworkDevice = {
                mac: '22222222222',
                ip: '192.168.1.22',
                vendor: 'bla bla brand name',
                name: 'some other name',
            };

            await DevicesBlMock.setDeviceName(localDevices);

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

            await DevicesBlMock.rescanNetwork();

            const devices = await DevicesBlMock.getDevices();

            expect(devices).length(localNetworkDevicesMock.length);
            expect(devices).to.include(newNetworkDevice);
        });
    });

    describe('Get system devices kinds', () => {
        it('it should get devices succsessfully', async () => {

            const devicesKinds = await DevicesBlMock.getDevicesKins();

            expect(devicesKinds).to.be.deep.equal(modulesManagerMock.devicesKind);
        });
    });

    describe('Feed devices update', () => {
        it('it should update name changes', (done) => {
            const localDevices: LocalNetworkDevice = {
                mac: '22222222222',
                ip: '192.168.1.2',
                vendor: 'bla bla brand name',
                name: 'update to a new other name',
            };
            const subscription = DevicesBlMock.devicesUpdate.subscribe((devices) => {
                if (!devices || devices.length < 1) {
                    return;
                }

                for (const device of devices) {
                    if (device.mac === localDevices.mac &&
                        device.name === localDevices.name) {
                        subscription.unsubscribe();
                        done();
                        return;

                    }
                }
            });

            Delay(moment.duration(1, 'seconds'))
                .then(() => {
                    DevicesBlMock.setDeviceName(localDevices);
                });
        }).timeout(moment.duration(10, 'seconds').asMilliseconds());

        it('it should update devices network data changed', (done) => {

            const networkDevicesExpected = localNetworkDevicesMock[1];
            networkDevicesExpected.ip = '192.168.1.77';

            let specDone = false;
            const subscription = DevicesBlMock.devicesUpdate.subscribe((devices) => {
                if (!devices || devices.length < 1) {
                    return;
                }

                if (specDone) {
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                    return;
                }
                for (const device of devices) {
                    if (networkDevicesExpected.mac === device.mac &&
                        networkDevicesExpected.ip === device.ip) {
                        specDone = true;
                        done();
                        return;

                    }
                }
            });

            Delay(moment.duration(1, 'seconds'))
                .then(() => {
                    DevicesBlMock.rescanNetwork();
                });
        });
    });
});
