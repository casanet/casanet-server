import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp = require('chai-http');
import app from '../App';
import { Login, LoginTfa } from '../models/interfaces';

chai.use(chaiHttp);
const agent = chai.request.agent(app);

describe('Authentication routing API', () => {

    describe('/POST auth/login', () => {
        it('it should respond 20x as status code', (done) => {
            const loginSchema: Login = {
                email: 'aa@bb.com',
                password: '1234',
            };

            agent.post('/API/auth/login')
                .send(loginSchema)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    expect(res).cookie('session', 'abc123456');
                    done();
                });
        });

        it('it should respond 40x as status code', (done) => {
            const loginSchema: Login = {
                email: 'baa@bb.com',
                password: '1234',
            };

            agent.post('/API/auth/login')
                .send(loginSchema)
                .end((err, res) => {
                    expect(res.statusType, 'wrong email passed').eql(4);
                    done();
                });
        });

        it('it should respond 20x as status code', (done) => {
            const loginSchema: Login = {
                email: 'aa@bb.com',
                password: '12345',
            };

            agent.post('/API/auth/login')
                .send(loginSchema)
                .end((err, res) => {
                    expect(res.statusType, 'wrong pasword passed').eql(4);
                    done();
                });
        });
    });

    describe('/POST auth/login/tfa', () => {
        it('it should respond 20x as status code', (done) => {
            const loginSchema: LoginTfa = {
                email: 'ggdg@fdfdf.com',
                password: '555555',
                tfaPassword: '123456',
            };

            agent.post('/API/auth/login/tfa')
                .send(loginSchema)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST auth/logout', () => {
        it('it should respond 20x as status code', (done) => {
            agent.post('/API/auth/logout')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
