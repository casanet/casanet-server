import * as chai from 'chai';
import { assert, expect } from 'chai';
import { OperationsDal } from '../../../src/data-layer/operationsDal';
import { IDataIO } from '../../../src/models/backendInterfaces';
import { Operation } from '../../../src/models/sharedInterfaces';
import { DeepCopy } from '../../../src/utilities/deepCopy';

class DataIOMock implements IDataIO {
  public mockData: Operation[] = [
    {
      operationId: 'a1',
      operationName: 'operation a',
      activities: [
        {
          minionId: 'n1',
          minionStatus: {
            switch: {
              status: 'off',
            },
          },
        },
      ],
    },
    {
      operationId: 'a2',
      operationName: 'operation b',
      activities: [
        {
          minionId: 'ac1',
          minionStatus: {
            airConditioning: {
              fanStrength: 'high',
              mode: 'hot',
              status: 'off',
              temperature: 25,
            },
          },
        },
      ],
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
const operationsDal = new OperationsDal(dataMock);

describe('Operations DAL tests', () => {
  describe('Get operations', () => {
    it('it should get operations succsessfully', async () => {
      const operations = await operationsDal.getOperations();

      expect(operations).to.deep.equal(dataMock.mockData);
      return;
    });
  });

  describe('Get operation by operation id', () => {
    it('it should get operation succsessfully', async () => {
      const operation = await operationsDal.getOperationById(dataMock.mockData[1].operationId);

      expect(operation).to.deep.equal(dataMock.mockData[1]);
      return;
    });
  });

  const additionalOperation: Operation = {
    operationId: 'fdgfgfg23hg6',
    operationName: 'name of',
    activities: [],
  };

  describe('Create new operation', () => {
    it('it should create operation succsessfully', async () => {
      await operationsDal.createOperation(additionalOperation);

      const operation = await operationsDal.getOperationById(additionalOperation.operationId);

      expect(operation).to.deep.equal(additionalOperation);
      expect(dataMock.mockData).to.have.length(3);
      return;
    });
  });

  describe('Delete operation', () => {
    it('it should delete operation succsessfully', async () => {
      await operationsDal.deleteOperation(additionalOperation.operationId);

      expect(dataMock.mockData).to.have.length(2);
      return;
    });
  });

  describe('Update operation', () => {
    it('it should update operation succsessfully', async () => {
      const operation: Operation = DeepCopy<Operation>(dataMock.mockData[1]);

      operation.activities.push({
        minionId: 'ac2',
        minionStatus: {
          airConditioning: {
            fanStrength: 'low',
            mode: 'hot',
            status: 'on',
            temperature: 25,
          },
        },
      });
      await operationsDal.updateOperation(operation);

      expect(dataMock.mockData).to.contains(operation);
      return;
    });
  });
});
