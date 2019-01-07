import { expect } from 'chai';
import { Operation } from '../src/models/sharedInterfaces';
import { validUserAgent } from './prepareRoutesSpecTests';

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
            validUserAgent.get('/API/operations/operationId')
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
            validUserAgent.put('/API/operations/operationId')
                .send(operation)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/DELETE operations/{operationId}', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.del('/API/operations/operationId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST operations/trigger/{operationId}', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.post('/API/operations/trigger/operationId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
