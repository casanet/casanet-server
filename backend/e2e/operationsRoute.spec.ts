import { expect } from 'chai';
import { OperationsDalSingleton } from '../src/data-layer/operationsDal';
import { Operation } from '../src/models/sharedInterfaces';
import { validUserAgent } from './prepareRoutesSpecTests.spec';

const operationMock: Operation = {
    operationId: 'o1',
    operationName: 'operation a',
    activities: [

    ],
};

OperationsDalSingleton.createOperation(operationMock)
    .then(() => {
        console.log('Generate mock operation in data successfuly');
    })
    .catch(() => {
        console.warn('Fail to operation mock minion in data');
    });

describe('Operations routing API', () => {

    describe('/GET operations', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/operations')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/GET operations/{operationId}', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/operations/o1')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST operations', () => {
        it('it should respond 20x as status code', (done) => {
            const operation: Operation = {
                activities: [],
                operationId: 'sdsds',
                operationName: 'sdsd',
            };
            validUserAgent.post('/API/operations')
                .send(operation)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/PUT operations/{userId}', () => {
        it('it should respond 20x as status code', (done) => {
            const operation: Operation = {
                activities: [],
                operationId: 'sdsds',
                operationName: 'sdsd',
            };
            validUserAgent.put('/API/operations/sdsds')
                .send(operation)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST operations/trigger/{operationId}', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.post('/API/operations/trigger/sdsds')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/DELETE operations/{operationId}', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.del('/API/operations/sdsds')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
