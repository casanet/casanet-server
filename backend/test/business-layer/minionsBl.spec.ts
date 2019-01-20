import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { MinionsBl } from '../../src/business-layer/minionsBl';
import { DevicesDal } from '../../src/data-layer/devicesDal';
import { MinionsDal } from '../../src/data-layer/minionsDal';
import { DeviceKind, ErrorResponse, LocalNetworkDevice, Minion, MinionDevice, MinionStatus, User } from '../../src/models/sharedInterfaces';
import { ModulesManager } from '../../src/modules/modulesManager';
import { Delay } from '../../src/utilities/sleep';
import { DevicesBlMock } from './devicesBl.spec';

class ModulesManagerMock {

    /**
     * Let subscribe to any status minion changed. from any brand module.
     */
    public minionStatusChangedEvent = new BehaviorSubject<{
        minionId: string;
        status: MinionStatus;
    }>({
        minionId: '',
        status: undefined,
    });

    constructor() {
        setInterval(() => {
            this.minionStatusChangedEvent.next({
                minionId: 'ac12345432',
                status: {
                    airConditioning: {
                        status: 'off',
                        fanStrength: 'high',
                        mode: 'dry',
                        temperature: 23,
                    },
                },
            });
        }, moment.duration('2', 'seconds').asMilliseconds());
    }
    public get devicesKind(): DeviceKind[] {
        return [
            {
                brand: 'test mock',
                isTokenRequierd: false,
                isIdRequierd : false,
                minionsPerDevice: 1,
                model: 'switch demo',
                suppotedMinionType: 'switch',
            },
            {
                brand: 'test mock',
                isTokenRequierd: true,
                isIdRequierd : false,
                minionsPerDevice: -1,
                model: 'switch demo with token',
                suppotedMinionType: 'switch',
            },
            {
                brand: 'test mock',
                isTokenRequierd: false,
                isIdRequierd : false,
                minionsPerDevice: -1,
                model: 'ac demo',
                suppotedMinionType: 'airConditioning',
            },
            {
                brand: 'test mock',
                isTokenRequierd: false,
                isIdRequierd : false,
                minionsPerDevice: -1,
                model: 'ac 2 demo',
                suppotedMinionType: 'airConditioning',
            },
            {
                brand: 'second test mock brand',
                isTokenRequierd: false,
                isIdRequierd : false,
                minionsPerDevice: -1,
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
        } else if (miniom.device.model === 'ac 2 demo') {
            throw {
                responseCode: 5000,
                message: 'unknown device communication error',
            } as ErrorResponse;
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
class MinionsDalMock {

    public mockMinions: Minion[] = [
        {
            device: {
                brand: 'mock',
                model: 'light demo',
                pysicalDevice: {
                    mac: '4341110986',
                },
            },
            isProperlyCommunicated: true,
            minionId: 'm3',
            minionType: 'light',
            minionStatus: {

            },
            name: 'bla bla 3',
        },
        {
            device: {
                brand: 'mock',
                model: 'switch demo',
                pysicalDevice: {
                    mac: '1111111111',
                },
            },
            isProperlyCommunicated: true,
            minionId: 'm1',
            minionType: 'switch',
            minionStatus: {

            },
            name: 'bla bla 1',
        },
        {
            device: {
                brand: 'mock',
                model: 'switch demo',
                pysicalDevice: {
                    mac: '33333333333',
                },
            },
            isProperlyCommunicated: true,
            minionId: 'm2',
            minionType: 'switch',
            minionStatus: {

            },
            name: 'bla bla 2',
        },
        {
            device: {
                brand: 'mock',
                model: 'ac demo',
                pysicalDevice: {
                    mac: 'ac12345432',
                },
            },
            isProperlyCommunicated: true,
            minionId: 'ac1',
            minionType: 'airConditioning',
            minionStatus: {

            },
            name: 'airConditioning a',
        },
        {
            device: {
                brand: 'mock',
                model: 'ac demo',
                pysicalDevice: {
                    mac: 'ac12345432',
                },
            },
            isProperlyCommunicated: true,
            minionId: 'ac2',
            minionType: 'airConditioning',
            minionStatus: {

            },
            name: 'airConditioning b',
        },
        {
            device: {
                brand: 'mock',
                model: 'ac demo',
                pysicalDevice: {
                    mac: '0987123ac',
                },
            },
            isProperlyCommunicated: true,
            minionId: 'n1',
            minionType: 'airConditioning',
            minionStatus: {

            },
            name: 'airConditioning b',
        },
    ];

    private findMinion(minionId: string): Minion {
        for (const minion of this.mockMinions) {
            if (minion.minionId === minionId) {
                return minion;
            }
        }
    }

    public async getMinions(): Promise<Minion[]> {
        return this.mockMinions;
    }

    public async getMinionsById(minionId: string): Promise<Minion> {
        const minion = this.findMinion(minionId);

        if (!minion) {
            throw new Error('minion not exist');
        }
        return minion;
    }

    public async createMinion(newMinion: Minion): Promise<void> {
        this.mockMinions.push(newMinion);
    }

    public async deleteMinion(minion: Minion): Promise<void> {
        const originalMinion = this.findMinion(minion.minionId);

        if (!originalMinion) {
            throw new Error('minion not exist');
        }

        this.mockMinions.splice(this.mockMinions.indexOf(originalMinion), 1);
    }
}

const minionsDalMock = new MinionsDalMock();
const modulesManagerMock = new ModulesManagerMock();
const minionsBl = new MinionsBl(minionsDalMock as unknown as MinionsDal,
    DevicesBlMock,
    modulesManagerMock as unknown as ModulesManager);

describe('Minions BL tests', () => {

    describe('Get minions', () => {
        it('it should get minions succsessfully', async () => {
            // wait for initilization
            await Delay(moment.duration(5, 'seconds'));

            const minions = await minionsBl.getMinions();

            const loadded: Minion = {
                device: {
                    brand: 'mock',
                    model: 'switch demo',
                    pysicalDevice: {
                        mac: '1111111111',
                        ip: '192.168.1.1',
                        name: 'first',
                    },
                },
                isProperlyCommunicated: true,
                minionId: 'm1',
                minionType: 'switch',
                minionStatus: {
                    switch: {
                        status: 'on',
                    },
                },
                name: 'bla bla 1',
            };

            expect(minions).to.be.a('array').length(minionsDalMock.mockMinions.length)
                .to.deep.include(loadded);
        }).timeout(moment.duration(10, 'seconds').asMilliseconds());

    });

    describe('Get minion by id', () => {
        it('it should get minion succsessfully', async () => {

            const minion = await minionsBl.getMinionById('m2');

            const expectMinion: Minion = {
                device: {
                    brand: 'mock',
                    model: 'switch demo',
                    pysicalDevice: {
                        mac: '33333333333',
                        ip: '192.168.1.3',
                        name: 'third',
                    },
                },
                isProperlyCommunicated: true,
                minionId: 'm2',
                minionType: 'switch',
                minionStatus: {
                    switch: {
                        status: 'on',
                    },
                },
                name: 'bla bla 2',
            };

            expect(minion).to.deep.include(expectMinion);
        });

        it('it should get unconnected minion', async () => {

            const minion = await minionsBl.getMinionById('m3');

            const expectMinion: Minion = {
                device: {
                    brand: 'mock',
                    model: 'light demo',
                    pysicalDevice: {
                        mac: '4341110986',
                    },
                },
                isProperlyCommunicated: false,
                minionId: 'm3',
                minionType: 'light',
                minionStatus: {},
                name: 'bla bla 3',
            };

            expect(minion).to.deep.include(expectMinion);
        });

        it('it should get minion device data when few in one pysical', async () => {

            const minion1 = await minionsBl.getMinionById('ac1');
            const minion2 = await minionsBl.getMinionById('ac2');
            const pysicalDevice: MinionDevice = {
                brand: 'mock',
                model: 'ac demo',
                pysicalDevice: {
                    mac: 'ac12345432',
                    ip: '192.168.1.90',
                    name: 'IR transmitter',
                },
            };

            expect(pysicalDevice)
                .to.deep.equal(minion1.device)
                .to.deep.equal(minion2.device);
        });
    });

    describe('Feed minion updates', () => {
        it('it should get minion succsessfully', (done) => {

            // TODO:
            // const subscription = minionsBl.minionFeed.subscribe((minionFeed) => {
            //     if (!minionFeed) {
            //         return;
            //     }

            //     subscription.unsubscribe();

            //     done();
            // });
            done();
        }).timeout(moment.duration(10, 'seconds').asMilliseconds());

        it('it should update minions network data changes', async () => {

            const newNamedLocalDevice: LocalNetworkDevice = {
                mac: '0987123ac',
                ip: '192.168.1.5',
                name: 'update by minions mock',
            };

            // const minions = await minionsBl.getMinions();

            await DevicesBlMock.setDeviceName(newNamedLocalDevice);

            await Delay(moment.duration(1, 'seconds'));

            const minion = await minionsBl.getMinionById('n1');

            expect(minion.device.pysicalDevice).to.be.deep.equal(newNamedLocalDevice);
        });
    });

    describe('Set minion status', () => {

        it('it should set status successfuly', async () => {

            const newStatus: MinionStatus = {
                switch: {
                    status: 'off',
                },
            };

            await minionsBl.setMinionStatus('m2', newStatus);

            const minion = await minionsBl.getMinionById('m2');

            expect(minion.minionStatus).to.be.deep.equal(newStatus);
        });

        it('it should fail to set status', async () => {

            const newStatus: MinionStatus = {
                airConditioning: {
                    fanStrength: 'auto',
                    mode: 'auto',
                    status: 'on',
                    temperature: 20,
                },
            };

            try {
                await minionsBl.setMinionStatus('m2', newStatus);
            } catch (error) {
                const expectedError: ErrorResponse = {
                    responseCode: 4122,
                    message: 'incorrect minion status, for current minion type',
                };
                expect(error).to.be.deep.equal(expectedError);

                return;
            }

            throw new Error('expect set status fail, the status value type incorrect.');
        });

        it('it should fail to set status', async () => {
            const newStatus: MinionStatus = {
                switch: {
                    status: 'off',
                },
            };

            try {
                await minionsBl.setMinionStatus('t404', newStatus);
            } catch (error) {
                const expectedError: ErrorResponse = {
                    responseCode: 4004,
                    message: 'minion not exist',
                };
                expect(error).to.be.deep.equal(expectedError);

                return;
            }

            throw new Error('expect set status fail, the minion id not exist.');
        });
    });

    describe('Set minion timeout', () => {

        it('it should set timeout successfuly', async () => {

            const minionBefor = {
                minionId: 'm2',
                minionAutoTurnOffMS: 342677771111,
            } as Minion;

            await minionsBl.setMinionTimeout(minionBefor.minionId, minionBefor);

            const minionafter = await minionsBl.getMinionById('m2');

            expect(minionafter.minionAutoTurnOffMS).to.be.deep.equal(minionBefor.minionAutoTurnOffMS);
        });

        it('it should fail to set timeout', async () => {
            const minionBefor = {
                minionId: 'm404',
                minionAutoTurnOffMS: 342677771111,
            } as Minion;

            try {
                await minionsBl.setMinionTimeout(minionBefor.minionId, minionBefor);
            } catch (error) {
                const expectedError: ErrorResponse = {
                    responseCode: 4004,
                    message: 'minion not exist',
                };
                expect(error).to.be.deep.equal(expectedError);

                return;
            }

            throw new Error('expect set status fail, the status value type incorrect.');
        });
    });

    describe('Create new minion', () => {

        it('it should create minion successfuly', async () => {
            const minion: Minion = {
                device: {
                    brand: 'test mock',
                    model: 'switch demo',
                    pysicalDevice: {
                        mac: '777777bb',
                    },
                },
                minionStatus: {

                },
                name: 'The new minion to create',
                minionType: 'switch',
            };

            await minionsBl.createMinion(minion);
        });

        it('it should create minion successfuly', async () => {
            const minionToCreate: Minion = {
                device: {
                    brand: 'test mock',
                    model: 'ac demo',
                    pysicalDevice: {
                        mac: '777777cc',
                    },
                },
                minionStatus: {

                },
                name: 'new minion to create',
                minionType: 'temperatureLight',
            };

            await minionsBl.createMinion(minionToCreate);

            const minions = await minionsBl.getMinions();

            let createdMinion: Minion;
            for (const minion of minions) {
                if (minion.device.pysicalDevice.mac ===
                    minionToCreate.device.pysicalDevice.mac) {
                    createdMinion = minion;
                    break;
                }
            }

            if (createdMinion &&
                createdMinion.minionType === 'airConditioning') {
                return;
            }

            throw new Error(`The minion type should fixed to 'airConditioning'`);
        });

        it('it should create minion successfuly', async () => {
            const minionToCreate: Minion = {
                device: {
                    brand: 'test mock',
                    model: 'ac 2 demo',
                    pysicalDevice: {
                        mac: '777777cc',
                    },
                },
                minionStatus: {

                },
                name: 'new minion to create',
                minionType: 'temperatureLight',
            };

            await minionsBl.createMinion(minionToCreate)
                .catch(() => {
                    throw new Error(`The minion should create even cant read current device status`);
                });
        });

        it('it should create minion successfuly', async () => {
            const minionToCreate: Minion = {
                device: {
                    brand: 'test mock',
                    model: 'ac demo',
                    pysicalDevice: {
                        mac: '777777dd',
                    },
                },
                minionStatus: {

                },
                name: 'new minion to create',
                minionType: 'temperatureLight',
            };

            await minionsBl.createMinion(minionToCreate);

            const minions = await minionsBl.getMinions();

            let createdMinion: Minion;
            for (const minion of minions) {
                if (minion.device.pysicalDevice.mac ===
                    minionToCreate.device.pysicalDevice.mac) {
                    createdMinion = minion;
                    break;
                }
            }

            const expectedStatus: MinionStatus = {
                airConditioning: {
                    fanStrength: 'med',
                    mode: 'cold',
                    status: 'on',
                    temperature: 21,
                },
            };
            expect(createdMinion.minionStatus).to.be.deep.equal(expectedStatus);
        });

        it('it should create minion successfuly', async () => {
            const minionToCreate: Minion = {
                device: {
                    brand: 'test mock',
                    model: 'ac demo',
                    pysicalDevice: {
                        mac: '777777ee',
                    },
                },
                minionStatus: {

                },
                name: 'new minion to create',
                minionType: 'airConditioning',
            };

            await minionsBl.createMinion(minionToCreate);

            const minions = await minionsBl.getMinions();

            let createdMinion: Minion;
            for (const minion of minions) {
                if (minion.device.pysicalDevice.mac ===
                    minionToCreate.device.pysicalDevice.mac) {
                    createdMinion = minion;
                    break;
                }
            }

            const pysicalInfo: LocalNetworkDevice = {
                mac: '777777ee',
                ip: '192.168.1.58',
                vendor: 'factory name',
            };

            expect(createdMinion.device.pysicalDevice).to.be.deep.equal(pysicalInfo);
        });

        it('it should fail to create minion', async () => {
            const minion: Minion = {
                device: {
                    brand: 'test mock a',
                    model: 'ac demo',
                    pysicalDevice: {
                        mac: '777777bb',
                    },
                },
                minionStatus: {

                },
                name: 'new minion to create',
                minionType: 'switch',
            };
            try {
                await minionsBl.createMinion(minion);
            } catch (error) {
                const errorResponse: ErrorResponse = {
                    responseCode: 4222,
                    message: 'there is no supported model for brand + model',
                };

                expect(error).to.be.deep.equal(errorResponse);

                return;
            }

            throw new Error('minion without token created, and model requier it');
        });

        it('it should fail to create minion', async () => {
            const minion: Minion = {
                device: {
                    brand: 'test mock',
                    model: 'ac demo 9999999',
                    pysicalDevice: {
                        mac: '111111aa',
                    },
                },
                minionStatus: {

                },
                name: 'The new minion to create',
                minionType: 'airConditioning',
            };
            try {
                await minionsBl.createMinion(minion);
            } catch (error) {
                const errorResponse: ErrorResponse = {
                    responseCode: 4222,
                    message: 'there is no supported model for brand + model',
                };

                expect(error).to.be.deep.equal(errorResponse);

                return;
            }

            throw new Error('minion with incorrect model created');
        });

        it('it should fail to create minion', async () => {
            const minion: Minion = {
                device: {
                    brand: 'second test mock brand',
                    model: 'switch demo',
                    pysicalDevice: {
                        mac: '111111aa',
                    },
                },
                minionStatus: {

                },
                name: 'The new minion to create',
                minionType: 'airConditioning',
            };
            try {
                await minionsBl.createMinion(minion);
            } catch (error) {
                const errorResponse: ErrorResponse = {
                    responseCode: 4222,
                    message: 'there is no supported model for brand + model',
                };

                expect(error).to.be.deep.equal(errorResponse);

                return;
            }

            throw new Error('minion with incorrect model of brand created');
        });

        it('it should fail to create minion', async () => {
            const minion: Minion = {
                device: {
                    brand: 'test mock',
                    model: 'switch demo with token',
                    pysicalDevice: {
                        mac: '111111aa',
                    },
                },
                minionStatus: {

                },
                name: 'The new minion to create',
                minionType: 'airConditioning',
            };
            try {
                await minionsBl.createMinion(minion);
            } catch (error) {
                const errorResponse: ErrorResponse = {
                    responseCode: 4322,
                    message: 'token is requird',
                };

                expect(error).to.be.deep.equal(errorResponse);

                return;
            }

            throw new Error('minion with incorrect model of brand created');
        });

        it('it should fail to create minion', async () => {
            const minion: Minion = {
                device: {
                    brand: 'test mock',
                    model: 'switch demo',
                    pysicalDevice: {
                        mac: '777777bb',
                    },
                },
                minionStatus: {

                },
                name: 'new minion to create',
                minionType: 'airConditioning',
            };
            try {
                await minionsBl.createMinion(minion);
            } catch (error) {
                const errorResponse: ErrorResponse = {
                    responseCode: 4422,
                    message: 'device already in max uses with other minion',
                };

                expect(error).to.be.deep.equal(errorResponse);

                return;
            }

            throw new Error('minion with taken device created');
        });

        it('it should fail to create minion', async () => {
            // there is no device in lan (unknown mac address).
            const minion: Minion = {
                device: {
                    brand: 'test mock',
                    model: 'switch demo',
                    pysicalDevice: {
                        mac: 'bbcc11187970',
                    },
                },
                minionStatus: {

                },
                name: 'new minion to create',
                minionType: 'airConditioning',
            };
            try {
                await minionsBl.createMinion(minion);
            } catch (error) {
                const errorResponse: ErrorResponse = {
                    responseCode: 4522,
                    message: 'device not exist in lan network',
                };

                expect(error).to.be.deep.equal(errorResponse);

                return;
            }

            throw new Error('minion with unknown mac address created');
        });

    });

    describe('Delete minion', () => {

        it('it should delete minion successfuly', async () => {
            const minions = await minionsBl.getMinions();
            let selectedMinion: Minion;
            for (const minion of minions) {
                if (minion.device.pysicalDevice.mac === '777777bb') {
                    selectedMinion = minion;
                    break;
                }
            }
            // Needs to copy by val.
            const beforDeleteMonionsCount = minions.length;

            await minionsBl.deleteMinion(selectedMinion.minionId);

            const minionsAfterDelete = await minionsBl.getMinions();
            expect(minionsAfterDelete.length).eqls(beforDeleteMonionsCount - 1);
        });

        it('it should fail to delete minion', async () => {

            try {
                await minionsBl.deleteMinion('sdgdsgdrrr555');
            } catch (error) {
                const errorResponse: ErrorResponse = {
                    responseCode: 4004,
                    message: 'minion not exist',
                };

                expect(error).to.be.deep.equal(errorResponse);
                return;
            }

            throw new Error('unknown minion deleted');
        });
    });
});
