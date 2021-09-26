import { expect } from 'chai';
import { RemoteSettings, User } from '../../src/models/sharedInterfaces';
import { validAdminAgent, validUserAgent } from './prepareRoutesSpecTests.spec';

describe('Remote connection routing API', () => {
  describe('/GET remote', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.get('/API/remote').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });

  describe('/GET remote/status', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.get('/API/remote/status').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });

  const remoteSettings: RemoteSettings = {
    host: 'ws://127.0.0.1/',
    connectionKey: 'abracadabra',
  };

  describe('/PUT remote', () => {
    it('it should respond 20x as status code', done => {
      validAdminAgent
        .put('/API/remote')
        .send(remoteSettings)
        .end((err, res) => {
          expect(res.statusType).eql(2);
          done();
        });
    });

    it('it should respond 40x as status code', done => {
      validUserAgent
        .put('/API/remote')
        .send(remoteSettings)
        .end((err, res) => {
          expect(res.statusType, 'user cant edit remote connection').eql(4);
          done();
        });
    });

    it('it should respond 50x as status code', done => {
      remoteSettings.host = 'invalided.com/wrong';
      validAdminAgent
        .put('/API/remote')
        .send(remoteSettings)
        .end((err, res) => {
          expect(res.status).eql(422);
          done();
        });
    });
  });

  describe('/DELETE remote', () => {
    it('it should respond 40x as status code', done => {
      validUserAgent.del('/API/remote').end((err, res) => {
        expect(res.statusType, 'user cant edit remote connection').eql(4);
        done();
      });
    });

    it('it should respond 20x as status code', done => {
      validAdminAgent.del('/API/remote').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });
});
