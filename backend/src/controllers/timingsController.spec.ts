import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp = require('chai-http');
import app from '../App';
import { Timing } from '../models/interfaces';

chai.use(chaiHttp);
const agent = chai.request.agent(app);

describe('Timings routing API', () => {

    describe('/GET timings', () => {
        it('it should respond 20x as status code', (done) => {
            agent.get('/API/timings')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/GET timings/{timingId}', () => {
        it('it should respond 20x as status code', (done) => {
            agent.get('/API/timings/timingId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST timings', () => {
        it('it should respond 20x as status code', (done) => {
            const timing: Timing = {
                isActive : true,
                timingId : 'fdfd',
                timingName : 'tm',
                timingProperties : {

                },
                timingType : 'dailyTimeTrigger',
                triggerOperationId : 'adfadf',
            };
            agent.post('/API/timings')
                .send(timing)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/PUT timings/{userId}', () => {
        it('it should respond 20x as status code', (done) => {
            const timing: Timing = {
                isActive : true,
                timingId : 'fdfd',
                timingName : 'tm',
                timingProperties : {

                },
                timingType : 'dailyTimeTrigger',
                triggerOperationId : 'adfadf',
            };
            agent.put('/API/timings/timingId')
                .send(timing)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/DELETE timings/{timingId}', () => {
        it('it should respond 20x as status code', (done) => {
            agent.del('/API/timings/timingId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
