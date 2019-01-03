import { expect } from 'chai';
import { Timing } from '../models/sharedInterfaces';
import { validUserAgent } from './prepareRoutesSpecTests';

describe('Timings routing API', () => {

    describe('/GET timings', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/timings')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/GET timings/{timingId}', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/timings/timingId')
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
            validUserAgent.post('/API/timings')
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
            validUserAgent.put('/API/timings/timingId')
                .send(timing)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/DELETE timings/{timingId}', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.del('/API/timings/timingId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
