import { expect } from 'chai';
import * as moment from 'moment';
import { LocalNetworkDevice } from '../../src/models/sharedInterfaces';
import { testLongSpecs, validUserAgent } from './prepareRoutesSpecTests.spec';

describe('Devices routing API', () => {
  describe('/GET devices', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.get('/API/devices').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });

  describe('/GET devices/kinds', () => {
    it('it should respond 20x as status code', done => {
      validUserAgent.get('/API/devices/kinds').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });
  });

  describe('/PUT devices/{deviceMac}', () => {
    it('it should respond 20x as status code', done => {
      const device: LocalNetworkDevice = {
        mac: '1111111111',
        name: 'dfdff',
      };
      validUserAgent
        .put(`/API/devices/${device.mac}`)
        .send(device)
        .end((err, res) => {
          expect(res.statusType).eql(5);
          done();
        });
    });
  });

  describe('/POST devices/rescan', () => {
    if (!testLongSpecs) {
      return;
    }

    it('it should respond 20x as status code', done => {
      validUserAgent.post('/API/devices/rescan').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    }).timeout(moment.duration(5, 'minutes').asMilliseconds());
  });
});
