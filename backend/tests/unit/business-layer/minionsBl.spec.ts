import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { DevicesService } from '../../../src/business-layer/devicesBl';
import { MinionsBl } from '../../../src/business-layer/minionsBl';
import { DevicesDal } from '../../../src/data-layer/devicesDal';
import { MinionsDal } from '../../../src/data-layer/minionsDal';
import {
  DeviceKind,
  ErrorResponse,
  LocalNetworkDevice,
  Minion,
  MinionDevice,
  MinionStatus,
  User,
} from '../../../src/models/sharedInterfaces';
import { ModulesManager } from '../../../src/modules/modulesManager';
import { Delay } from '../../../src/utilities/sleep';
import { DevicesDalMock } from '../data-layer/devicesDal.mock.spec';
import { MinionsDalMock } from '../data-layer/minionsDal.mock.spec';
import { ModulesManagerMock } from '../modules/modulesManager.mock.spec';
import { localNetworkReaderMock } from '../utilities/lanManager.mock.spec';

const devicesDalMock = new DevicesDalMock();
const modulesManagerMock = new ModulesManagerMock();
const minionsDalMock = new MinionsDalMock();

const devicesBlMock = new DevicesService(
  (devicesDalMock as unknown) as DevicesDal,
  localNetworkReaderMock,
  (modulesManagerMock as unknown) as ModulesManager,
);

const minionsBl = new MinionsBl(
  (minionsDalMock as unknown) as MinionsDal,
  devicesBlMock,
  (modulesManagerMock as unknown) as ModulesManager,
);
minionsBl.initMinionsModule();

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

      expect(minions)
        .to.be.a('array')
        .length(minionsDalMock.mockMinions.length)
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
    it('it should get minion succsessfully', done => {
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

      await devicesBlMock.setDeviceName(newNamedLocalDevice);

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

      await minionsBl.setMinionStatus('m2', newStatus, 'user');

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
        await minionsBl.setMinionStatus('m2', newStatus, 'user');
      } catch (error) {
        const expectedError: ErrorResponse = {
          responseCode: 1405,
          message: 'incorrect minion status for current minion type',
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
        await minionsBl.setMinionStatus('t404', newStatus, 'user');
      } catch (error) {
        const expectedError: ErrorResponse = {
          responseCode: 1404,
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

      await minionsBl.setMinionTimeout(minionBefor.minionId || '', minionBefor.minionAutoTurnOffMS || 0);

      const minionafter = await minionsBl.getMinionById('m2');

      expect(minionafter.minionAutoTurnOffMS).to.be.deep.equal(minionBefor.minionAutoTurnOffMS);
    });

    it('it should set timeout successfuly', async () => {
      const minionBefor = {
        minionId: 'm2',
        minionAutoTurnOffMS: 845642321,
      } as Minion;

      await minionsBl.setMinionTimeout(minionBefor.minionId || '', minionBefor.minionAutoTurnOffMS || 0);

      const minionafter = await minionsDalMock.getMinionById('m2');

      expect(minionafter.minionAutoTurnOffMS).to.be.deep.equal(minionBefor.minionAutoTurnOffMS);
    });

    it('it should fail to set timeout', async () => {
      const minionBefor = {
        minionId: 'm404',
        minionAutoTurnOffMS: 342677771111,
      } as Minion;

      try {
        await minionsBl.setMinionTimeout(minionBefor.minionId || '', minionBefor.minionAutoTurnOffMS || 0);
      } catch (error) {
        const expectedError: ErrorResponse = {
          responseCode: 1404,
          message: 'minion not exist',
        };
        expect(error).to.be.deep.equal(expectedError);

        return;
      }

      throw new Error('expect set status fail, the status value type incorrect.');
    });
  });

  describe('Create new minion', () => {
    it('it should create minion successfully', async () => {
      const minion: Minion = {
        device: {
          brand: 'test mock',
          model: 'switch demo',
          pysicalDevice: {
            mac: '777777bb',
          },
        },
        minionStatus: {},
        name: 'The new minion to create',
        minionType: 'switch',
      };

      await minionsBl.createMinion(minion);
    });

    it('it should create minion successfully', async () => {
      const minionToCreate: Minion = {
        device: {
          brand: 'test mock',
          model: 'ac demo',
          pysicalDevice: {
            mac: '777777cc',
          },
        },
        minionStatus: {},
        name: 'new minion to create',
        minionType: 'temperatureLight',
      };

      await minionsBl.createMinion(minionToCreate);

      const minions = await minionsBl.getMinions();

      let createdMinion: Minion = undefined as unknown as Minion;
      for (const minion of minions) {
        if (minion.device.pysicalDevice.mac === minionToCreate.device.pysicalDevice.mac) {
          createdMinion = minion;
          break;
        }
      }

      if (createdMinion && createdMinion.minionType === 'airConditioning') {
        return;
      }

      throw new Error(`The minion type should fixed to 'airConditioning'`);
    });

    it('it should create minion successfully', async () => {
      const minionToCreate: Minion = {
        device: {
          brand: 'test mock',
          model: 'ac 2 demo',
          pysicalDevice: {
            mac: '777777cc',
          },
        },
        minionStatus: {},
        name: 'new minion to create',
        minionType: 'temperatureLight',
      };

      await minionsBl.createMinion(minionToCreate).catch(() => {
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
        minionStatus: {},
        name: 'new minion to create',
        minionType: 'temperatureLight',
      };

      await minionsBl.createMinion(minionToCreate);

      const minions = await minionsBl.getMinions();

      let createdMinion: Minion = undefined as any;
      for (const minion of minions) {
        if (minion.device.pysicalDevice.mac === minionToCreate.device.pysicalDevice.mac) {
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
      expect(createdMinion?.minionStatus).to.be.deep.equal(expectedStatus);
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
        minionStatus: {},
        name: 'new minion to create',
        minionType: 'airConditioning',
      };

      await minionsBl.createMinion(minionToCreate);

      const minions = await minionsBl.getMinions();

      let createdMinion: Minion = undefined as any;
      for (const minion of minions) {
        if (minion.device.pysicalDevice.mac === minionToCreate.device.pysicalDevice.mac) {
          createdMinion = minion;
          break;
        }
      }

      const pysicalInfo: LocalNetworkDevice = {
        mac: '777777ee',
        ip: '192.168.1.58',
        name: "------------",
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
        minionStatus: {},
        name: 'new minion to create',
        minionType: 'switch',
      };
      try {
        await minionsBl.createMinion(minion);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          responseCode: 1409,
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
        minionStatus: {},
        name: 'The new minion to create',
        minionType: 'airConditioning',
      };
      try {
        await minionsBl.createMinion(minion);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          responseCode: 1409,
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
        minionStatus: {},
        name: 'The new minion to create',
        minionType: 'airConditioning',
      };
      try {
        await minionsBl.createMinion(minion);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          responseCode: 1409,
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
        minionStatus: {},
        name: 'The new minion to create',
        minionType: 'airConditioning',
      };
      try {
        await minionsBl.createMinion(minion);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          responseCode: 2409,
          message: 'token is required',
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
        minionStatus: {},
        name: 'new minion to create',
        minionType: 'airConditioning',
      };
      try {
        await minionsBl.createMinion(minion);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          responseCode: 4409,
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
        minionStatus: {},
        name: 'new minion to create',
        minionType: 'airConditioning',
      };
      try {
        await minionsBl.createMinion(minion);
      } catch (error) {
        const errorResponse: ErrorResponse = {
          responseCode: 2404,
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
      let selectedMinion: Minion = undefined as any;
      for (const minion of minions) {
        if (minion.device.pysicalDevice.mac === '777777bb') {
          selectedMinion = minion;
          break;
        }
      }
      // Needs to copy by val.
      const beforDeleteMonionsCount = minions.length;

      await minionsBl.deleteMinion(selectedMinion.minionId || '');

      const minionsAfterDelete = await minionsBl.getMinions();
      expect(minionsAfterDelete.length).eqls(beforDeleteMonionsCount - 1);
    });

    it('it should fail to delete minion', async () => {
      try {
        await minionsBl.deleteMinion('sdgdsgdrrr555');
      } catch (error) {
        const errorResponse: ErrorResponse = {
          responseCode: 1404,
          message: 'minion not exist',
        };

        expect(error).to.be.deep.equal(errorResponse);
        return;
      }

      throw new Error('unknown minion deleted');
    });
  });
});
