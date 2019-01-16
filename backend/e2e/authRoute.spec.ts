import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp = require('chai-http');
import app from '../src/App';
import { Login, LoginTfa } from '../src/models/sharedInterfaces';
import { validSystemAdmin, validSystemUser } from './prepareRoutesSpecTests.spec';

chai.use(chaiHttp);
const agent = chai.request.agent(app);

describe('Authentication routing API', () => {

    describe('/POST auth/login', () => {
        it('it should respond 20x as status code', (done) => {
            const loginSchema: Login = {
                email: validSystemUser.email,
                password: validSystemUser.password,
            };

            agent.post('/API/auth/login')
                .send(loginSchema)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    expect(res).cookie('session');
                    done();
                });
        });

        it('it should respond 40x as status code', (done) => {
            const loginSchema: Login = {
                email: validSystemUser.email + 'e',
                password: validSystemUser.password,
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
                email: validSystemUser.email,
                password: validSystemUser.password + 'e',
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
                email: validSystemUser.email,
                password: validSystemUser.email,
                tfaPassword: 'TODO',
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

        it('it should respond 40x as status code', (done) => {
            const unauthAgent = chai.request.agent(app);
            unauthAgent.post('/API/auth/logout')
                .end((err, res) => {
                    expect(res.statusType).eql(4);
                    done();
                });
        });
    });
});
