import { ErrorResponse, Minion } from '../../../src/models/sharedInterfaces';

export class MinionsDalMock {
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
      minionStatus: {},
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
      minionStatus: {},
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
      minionStatus: {},
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
      minionStatus: {},
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
      minionStatus: {},
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
      minionStatus: {},
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

  public async getMinionById(minionId: string): Promise<Minion> {
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

  public async updateMinionAutoTurnOff(minionId: string, setAutoTurnOffMS: number): Promise<void> {
    const originalMinion = this.findMinion(minionId);

    if (!originalMinion) {
      throw {
        responseCode: 4004,
        message: 'minion not exist',
      } as ErrorResponse;
    }

    originalMinion.minionAutoTurnOffMS = setAutoTurnOffMS;
  }
}
