import { expect } from 'chai';
import { DeviceName } from './devicesController';
import { validUserAgent } from './prepareAuthorizeSpecAgent';

describe('Devices routing API', () => {

    describe('/GET devices', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/devices')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/GET devices/kinds', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/devices/kinds')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/PUT devices/{deviceMac}', () => {
        it('it should respond 20x as status code', (done) => {
            const deviceName: DeviceName = {
                name: 'dfdff',
            };
            validUserAgent.put('/API/devices/deviceMac')
                .send(deviceName)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST devices/rescan', () => {
        it('it should respond 20x as status code', (done) => {
            validUserAgent.post('/API/devices/rescan')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
