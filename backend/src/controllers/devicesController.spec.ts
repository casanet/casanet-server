import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp = require('chai-http');
import app from '../App';
import { DeviceName } from './devicesController';

chai.use(chaiHttp);
const agent = chai.request.agent(app);

describe('Devices routing API', () => {

    describe('/GET devices', () => {
        it('it should respond 20x as status code', (done) => {
            agent.get('/API/devices')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/GET devices/kinds', () => {
        it('it should respond 20x as status code', (done) => {
            agent.get('/API/devices/kinds')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/PUT devices/{deviceMac}', () => {
        it('it should respond 20x as status code', (done) => {
            const deviceName: DeviceName = {
               name : 'dfdff',
            };
            agent.put('/API/devices/deviceMac')
                .send(deviceName)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST devices/rescan', () => {
        it('it should respond 20x as status code', (done) => {
            agent.post('/API/devices/rescan')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
