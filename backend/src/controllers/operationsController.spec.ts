import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp = require('chai-http');
import app from '../App';
import { Operation } from '../models/interfaces';

chai.use(chaiHttp);
const agent = chai.request.agent(app);

describe('Operations routing API', () => {

    describe('/GET operations', () => {
        it('it should respond 20x as status code', (done) => {
            agent.get('/API/operations')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/GET operations/{operationId}', () => {
        it('it should respond 20x as status code', (done) => {
            agent.get('/API/operations/operationId')
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
            agent.post('/API/operations')
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
            agent.put('/API/operations/operationId')
                .send(operation)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/DELETE operations/{operationId}', () => {
        it('it should respond 20x as status code', (done) => {
            agent.del('/API/operations/operationId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST operations/trigger/{operationId}', () => {
        it('it should respond 20x as status code', (done) => {
            agent.post('/API/operations/trigger/operationId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
