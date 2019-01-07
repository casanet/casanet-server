import { expect } from 'chai';
import { Minion } from '../src/models/sharedInterfaces';
import { validUserAgent } from './prepareRoutesSpecTests';

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
            validUserAgent.get('/API/minions/minionId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST minions', () => {
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
            validUserAgent.post('/API/minions')
                .send(minion)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/PUT minions/{minionId}', () => {
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
            validUserAgent.put('/API/minions/minionId')
                .send(minion)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/DELETE minions/{minionId}', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.del('/API/minions/minionId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
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
            validUserAgent.put('/API/minions/timeout/minionId')
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
            };
            validUserAgent.post('/API/minions/command/minionId')
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
});
