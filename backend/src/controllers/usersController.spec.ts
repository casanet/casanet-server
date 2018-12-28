import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp = require('chai-http');
import app from '../App';

chai.use(chaiHttp);

describe('API-Devices', () => {

    describe('/GET device', () => {
        it('it should GET device by id', (done) => {
            chai.request(app)
                .get('/API/Devices/aa:bb:cc:dd')
                .set({
                    cookie : 'session=aaaaaaaaaaaaaaaaaaa',
                })
                .end((err, res) => {

                    expect(res).have.status(200);
                    expect(res.body).be.a('object');
                    expect(res.body).include.keys('mac');
                    done();
                });
        });
    });
});
