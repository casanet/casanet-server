import { expect } from 'chai';
import * as moment from 'moment';
import { MinionsDalSingleton } from '../src/data-layer/minionsDal';
import { ErrorResponse, Minion, MinionStatus } from '../src/models/sharedInterfaces';
import { validUserAgent } from './prepareRoutesSpecTests.spec';

const minioinMock: Minion = {
    device: {
        brand: 'mock',
        model: 'switch demo',
        pysicalDevice: {
            mac: '45543544',
        },
    },
    isProperlyCommunicated: true,
    minionId: 'm1',
    minionType: 'switch',
    minionStatus: {

    },
    name: 'bla bla 1',
};
MinionsDalSingleton.createMinion(minioinMock)
    .then(() => {
        console.log('Generate mock minion in data successfuly');
    })
    .catch(() => {
        console.warn('Fail to generate mock minion in data');
    });

describe('Minions routing API', () => {

    describe('/GET minions', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/minions')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/GET minions/{minionId}', () => {

        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/minions/m1')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST minions', () => {
        it('it should respond 501 as status code', (done) => {
            const minion: Minion = {
                device: {
                    brand: 'mock',
                    model: 'ac demo',
                    pysicalDevice: {
                        mac: '????????',
                    },
                },
                minionType: 'light',
                name: 'dfdf',
                minionStatus: {

                },
            };
            validUserAgent.post('/API/minions')
                .send(minion)
                .end((err, res) => {

                    const errorResponse: ErrorResponse = {
                        responseCode: 4522,
                        message: 'device not exist in lan network',
                    };
                    expect(res.body).to.be.deep.equal(errorResponse);
                    done();
                });
        });
    });

    describe('/PUT minions/{minionId}', () => {
        it('it should respond 20x as status code', (done) => {
            const minionStatus: MinionStatus = {
                switch: {
                    status: 'off',
                },
            };
            validUserAgent.put('/API/minions/m1')
                .send(minionStatus)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/DELETE minions/{minionId}', () => {
        it('it should respond 501 as status code', (done) => {
            validUserAgent.del('/API/minions/minionId')
                .end((err, res) => {
                    const errorResponse: ErrorResponse = {
                        responseCode: 4004,
                        message: 'minion not exist',
                    };
                    expect(res.body).to.be.deep.equal(errorResponse);
                    done();
                });
        });
    });

    describe('/PUT minions/timeout/{minionId}', () => {
        it('it should respond 20x as status code', (done) => {
            const minion: Minion = {
                device: {
                    brand: '',
                    model: '',
                    pysicalDevice: {
                        mac: '11111111',
                    },
                },
                isProperlyCommunicated: true,
                minionId: 'vf',
                minionType: 'light',
                name: 'dfdf',
                minionStatus: {

                },
            };
            validUserAgent.put('/API/minions/timeout/m1')
                .send(minion)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST minions/command/{minionId}', () => {
        it('it should respond 20x as status code', (done) => {
            const minion: Minion = {
                device: {
                    brand: '',
                    model: '',
                    pysicalDevice: {
                        mac: '11111111',
                    },
                },
                isProperlyCommunicated: true,
                minionId: 'vf',
                minionType: 'light',
                name: 'dfdf',
                minionStatus: {

                },
                minionAutoTurnOffMS: 5555555,
            };
            validUserAgent.post('/API/minions/command/m1')
                .send(minion)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST minions/rescan', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.post('/API/minions/rescan')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST minions/rescan/{minionId}', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.post('/API/minions/rescan/m1')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
