import { expect } from 'chai';
import { OperationsDalSingleton } from '../../src/data-layer/operationsDal';
import { Operation } from '../../src/models/sharedInterfaces';
import { validUserAgent } from './prepareRoutesSpecTests.spec';

const operationMock: Operation = {
  operationId: 'o1',
  operationName: 'operation a',
  activities: [],
};

OperationsDalSingleton.createOperation(operationMock)
  .then(() => {
    console.log('Generate mock operation in data successfuly');
  })
  .catch(() => {
    console.warn('Fail to operation mock minion in data');
  });

describe('Operations routing API', () => {
  describe('/GET operations/{operationId}', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.get('/API/operations/o1').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });

  const operationToPost: Operation = {
    activities: [],
    operationId: 'sdsds',
    operationName: 'sdsd',
  };

  describe('/POST operations', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent
        .post('/API/operations')
        .send(operationToPost)
        .end((err, res) => {
          expect(res.statusType).eql(2);
          done();
        });
    });
  });

  describe('/GET operations', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.get('/API/operations').end((err, res) => {
        expect(res.statusType).eql(2);

        // By the way, update the posted operation id.
        const operations: Operation[] = res.body;
        operationToPost.operationId = operations[operations.length - 1].operationId;

        done();
      });
    });
  });

  describe('/PUT operations/{userId}', () => {
    it('it should respond 20x as status code', done => {
      const operation: Operation = {
        activities: [],
        operationId: 'sdsds',
        operationName: 'sdsd',
      };
      validUserAgent
        .put(`/API/operations/${operationToPost.operationId}`)
        .send(operation)
        .end((err, res) => {
          expect(res.statusType).eql(2);
          done();
        });
    });
  });

  describe('/POST operations/trigger/{operationId}', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.post(`/API/operations/trigger/${operationToPost.operationId}`).end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });

  describe('/DELETE operations/{operationId}', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.del(`/API/operations/${operationToPost.operationId}`).end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });
});
