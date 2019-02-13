import { expect } from 'chai';
import { RemoteSettings, User } from '../src/models/sharedInterfaces';
import { validAdminAgent, validUserAgent } from './prepareRoutesSpecTests.spec';

describe('Remote connection routing API', () => {

    describe('/GET remote/connection', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/remote/connection')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/GET remote/connection/status', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/remote/connection/status')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    const remoteSettings: RemoteSettings = {
        host: 'localhost',
        connectionKey: 'abracadabra',
    };

    describe('/PUT remote/connection', () => {
        it('it should respond 20x as status code', (done) => {
            validAdminAgent.put('/API/remote/connection')
                .send(remoteSettings)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });

        it('it should respond 40x as status code', (done) => {
            validUserAgent.put('/API/remote/connection')
                .send(remoteSettings)
                .end((err, res) => {
                    expect(res.statusType, 'user cant edit remote connection').eql(4);
                    done();
                });
        });

        it('it should respond 50x as status code', (done) => {
            remoteSettings.host = 'invalied.com/wrong';
            validAdminAgent.put('/API/remote/connection')
                .send(remoteSettings)
                .end((err, res) => {
                    expect(res.statusType).eql(5);
                    done();
                });
        });
    });

    describe('/DELETE remote/connection', () => {
        it('it should respond 40x as status code', (done) => {
            validUserAgent.del('/API/remote/connection')
                .end((err, res) => {
                    expect(res.statusType, 'user cant edit remote connection').eql(4);
                    done();
                });
        });

        it('it should respond 20x as status code', (done) => {
            validAdminAgent.del('/API/remote/connection')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });

    });

});
