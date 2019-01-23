import { expect } from 'chai';
import { TimingsDalSingleton } from '../src/data-layer/timingsDal';
import { Timing } from '../src/models/sharedInterfaces';
import { validUserAgent } from './prepareRoutesSpecTests.spec';

const timingMock: Timing = {
    isActive: true,
    timingId: 'td1',
    timingName: 'timing a',
    timingProperties: {
        once: {
            date: 77777,
        },
    },
    timingType: 'once',
    triggerOperationId: 'o1',
};

TimingsDalSingleton.createTiming(timingMock)
    .then(() => {
        console.log('Generate mock timing in data successfuly');
    })
    .catch(() => {
        console.warn('Fail to generate mock timing in data');
    });
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
            validUserAgent.get('/API/timings/td1')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST timings', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.post('/API/timings')
                .send(timingMock)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/PUT timings/{userId}', () => {
        it('it should respond 20x as status code', (done) => {
            timingMock.isActive = false;
            validUserAgent.put('/API/timings/td1')
                .send(timingMock)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/DELETE timings/{timingId}', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.del('/API/timings/td1')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
