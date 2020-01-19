import * as chai from 'chai';
import { assert, expect } from 'chai';
import { MinionsDal } from '../../../src/data-layer/minionsDal';
import { IDataIO, Session } from '../../../src/models/backendInterfaces';
import { Minion } from '../../../src/models/sharedInterfaces';
import { logger } from '../../../src/utilities/logger';

class DataIOMock implements IDataIO {
  public mockData: Minion[] = [
    {
      device: {
        brand: 'mock',
        model: 'mock model 1',
        pysicalDevice: {
          mac: '45543544',
        },
      },
      isProperlyCommunicated: true,
      minionId: 'm1',
      minionType: 'switch',
      minionStatus: {},
      name: 'bla bla 1',
    },
    {
      device: {
        brand: 'mock',
        model: 'mock model 2',
        pysicalDevice: {
          mac: '645425545422',
        },
      },
      isProperlyCommunicated: true,
      minionId: 'm2',
      minionType: 'airConditioning',
      minionStatus: {},
      name: 'bla bla 2',
    },
    {
      device: {
        brand: 'mock',
        model: 'mock model 3',
        pysicalDevice: {
          mac: '4341110986',
        },
      },
      isProperlyCommunicated: true,
      minionId: 'm3',
      minionType: 'light',
      minionStatus: {},
      name: 'bla bla 3',
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
const minionsDal = new MinionsDal(dataMock);

describe('Minions DAL tests', () => {
  describe('Get minions', () => {
    it('it should get minions succsessfully', async () => {
      const minions = await minionsDal.getMinions();

      expect(minions).to.deep.equal(dataMock.mockData);
      return;
    });
  });

  describe('Get minion by minion id', () => {
    it('it should get minion succsessfully', async () => {
      const minion = await minionsDal.getMinionById(dataMock.mockData[1].minionId);

      expect(minion).to.deep.equal(dataMock.mockData[1]);
      return;
    });
  });

  const additionalMinion: Minion = {
    device: {
      brand: 'mock',
      model: 'mock model 4',
      pysicalDevice: {
        mac: '3226445f',
      },
    },
    isProperlyCommunicated: true,
    minionId: 'm4',
    minionType: 'light',
    minionStatus: {},
    name: 'bla bla 4',
  };

  describe('Create new minion', () => {
    it('it should create minion succsessfully', async () => {
      await minionsDal.createMinion(additionalMinion);

      const minion = await minionsDal.getMinionById(additionalMinion.minionId);

      expect(minion).to.deep.equal(additionalMinion);
      expect(dataMock.mockData).to.have.length(4);
      return;
    });
  });

  describe('Update minion auto turn off timeout', () => {
    it('it should update minion succsessfully', async () => {
      const newTurnOffTimeout = 500000;

      await minionsDal.updateMinionAutoTurnOff(additionalMinion.minionId, newTurnOffTimeout);

      const minion = await minionsDal.getMinionById(additionalMinion.minionId);

      expect(minion.minionAutoTurnOffMS).to.be.eql(newTurnOffTimeout);
      return;
    });
  });

  describe('Delete minion', () => {
    it('it should delete minion succsessfully', async () => {
      await minionsDal.deleteMinion(additionalMinion);

      expect(dataMock.mockData).to.have.length(3);
      return;
    });
  });
});
