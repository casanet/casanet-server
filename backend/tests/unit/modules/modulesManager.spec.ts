import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { testLongSpecs } from '../../e2e/prepareRoutesSpecTests.spec';
import { ErrorResponse, Minion, MinionStatus } from '../../../src/models/sharedInterfaces';
import { ModulesManager } from '../../../src/modules/modulesManager';

const modulesManager = new ModulesManager();

const switchMinionMock: Minion = {
  device: {
    brand: 'mock',
    model: 'switch demo',
    pysicalDevice: {
      mac: '4343434343',
    },
  },
  minionId: 'rtvhavmnj',
  minionType: 'switch',
  name: 'switchMinionDemo',
  isProperlyCommunicated: true,
  minionStatus: {},
};

const acMinionMock: Minion = {
  device: {
    brand: 'mock',
    model: 'ac demo',
    pysicalDevice: {
      mac: '6565656565665',
    },
  },
  minionId: 'frs74nhk',
  minionType: 'airConditioning',
  name: 'switchMinionDemo',
  isProperlyCommunicated: true,
  minionStatus: {},
};

const lightMinionMock: Minion = {
  device: {
    brand: 'mock',
    model: 'light demo',
    pysicalDevice: {
      mac: '6262626262',
    },
  },
  minionId: 'dfjmevckrt5',
  minionType: 'light',
  name: 'lightMinionDemo',
  isProperlyCommunicated: true,
  minionStatus: {},
};

describe('Modules Manager tests', () => {
  describe('Modules pysical updates tests', () => {
    it('it should get pysical updates', done => {
      // TODO:
      // let acArrived = false;
      // const subscription = modulesManager.minionStatusChangedEvent.subscribe((update) => {
      //     if (update.minionId === '656565656') {
      //         expect(update).to.be.deep.equal({
      //             minionId: '656565656',
      //             status: {
      //                 airConditioning: {
      //                     status: 'off',
      //                     fanStrength: 'high',
      //                     mode: 'cold',
      //                     temperature: 20,
      //                 },
      //             },
      //         });
      //         acArrived = true;
      //     }

      //     if (acArrived) {
      //         subscription.unsubscribe();
      //         done();
      //     }
      // });
      done();
    }).timeout(moment.duration(20, 'seconds').asMilliseconds());
  });

  describe('set minion status tests', () => {
    it('it should set switch minoion status', async () => {
      await modulesManager.setStatus(switchMinionMock, {
        switch: {
          status: 'on',
        },
      });
    });

    it('it should set ac minoion status', async () => {
      await modulesManager.setStatus(acMinionMock, {
        airConditioning: {
          status: 'off',
          fanStrength: 'high',
          mode: 'cold',
          temperature: 20,
        },
      });
    });

    it('it should fail to set unknown light minoion status', async () => {
      try {
        await modulesManager.setStatus(lightMinionMock, {
          airConditioning: {
            status: 'off',
            fanStrength: 'high',
            mode: 'cold',
            temperature: 20,
          },
        });
      } catch (error) {
        expect(error).to.be.deep.equal({
          responseCode: 8404,
          message: 'unknown minion model',
        } as ErrorResponse);
        return;
      }
      throw new Error('Tring to turn off unkknown light not fail.');
    });
  });

  describe('get minion status tests', () => {
    it('it should get switch minoion status', async () => {
      const status = (await modulesManager.getStatus(switchMinionMock)) as MinionStatus;

      expect(status).to.be.deep.equal({
        switch: {
          status: 'on',
        },
      });
    });

    it('it should get ac minoion status', async () => {
      const status = (await modulesManager.getStatus(acMinionMock)) as MinionStatus;

      expect(status).to.be.deep.equal({
        airConditioning: {
          fanStrength: 'med',
          mode: 'cold',
          status: 'on',
          temperature: 21,
        },
      });
    });

    it('it should fail to get unknown light minoion status', async () => {
      try {
        await modulesManager.getStatus(lightMinionMock);
      } catch (error) {
        expect(error).to.be.deep.equal({
          responseCode: 8404,
          message: 'unknown minion model',
        } as ErrorResponse);
        return;
      }
      throw new Error('Tring get status of unkknown light not fail.');
    });
  });

  describe('record commands tests', () => {
    it('it should record successfuly', async () => {
      await modulesManager.enterRecordMode(acMinionMock, {});
    });

    it('it should fail record', async () => {
      try {
        await modulesManager.enterRecordMode(switchMinionMock, {});
      } catch (error) {
        expect(error).to.be.deep.equal({
          responseCode: 6409,
          message: `the minioin not support command recording or sending`,
        } as ErrorResponse);
        return;
      }
      throw new Error('Tring record command on unsupported model.');
    });
  });

  describe('generate commands tests', () => {
    it('it should generate successfuly', async () => {
      await modulesManager.generateCommand(acMinionMock, {});
    });

    it('it should fail record', async () => {
      try {
        await modulesManager.generateCommand(switchMinionMock, {});
      } catch (error) {
        expect(error).to.be.deep.equal({
          responseCode: 6409,
          message: `the minioin not support command recording or sending`,
        } as ErrorResponse);
        return;
      }
      throw new Error('Tring record command on unsupported model.');
    });
  });
});
