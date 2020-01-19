import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp = require('chai-http');
import * as moment from 'moment';
import app from '../../src/App';
import { Login } from '../../src/models/sharedInterfaces';
import {
  validAdminPlainPassword,
  validSystemAdmin,
  validSystemUser,
  validUserPlainPassword,
} from './prepareRoutesSpecTests.spec';

chai.use(chaiHttp);
const agent = chai.request.agent(app);

describe('Authentication routing API', () => {
  describe('/POST auth/login', () => {
    it('it should respond 20x as status code', done => {
      const loginSchema: Login = {
        email: validSystemUser.email,
        password: validUserPlainPassword,
      };

      agent
        .post('/API/auth/login')
        .send(loginSchema)
        .end((err, res) => {
          expect(res.statusType).eql(2);
          expect(res).cookie('session');
          done();
        });
    }).timeout(moment.duration(15, 'seconds').asMilliseconds());

    it('it should respond 40x as status code', done => {
      const loginSchema: Login = {
        email: validSystemUser.email + 'e',
        password: validUserPlainPassword,
      };

      agent
        .post('/API/auth/login')
        .send(loginSchema)
        .end((err, res) => {
          expect(res.statusType, 'wrong email passed').eql(4);
          done();
        });
    });

    it('it should respond 20x as status code', done => {
      const loginSchema: Login = {
        email: validSystemUser.email,
        password: validUserPlainPassword + 'e',
      };

      agent
        .post('/API/auth/login')
        .send(loginSchema)
        .end((err, res) => {
          expect(res.statusType, 'wrong pasword passed').eql(4);
          done();
        });
    });
  });

  describe('/POST auth/login/tfa', () => {
    it('it should respond 20x as status code', done => {
      const loginSchema: Login = {
        email: validSystemUser.email,
        password: validUserPlainPassword,
      };

      agent
        .post('/API/auth/login/tfa')
        .send(loginSchema)
        .end((err, res) => {
          expect(res.statusType).eql(4);
          done();
        });
    });
  });

  describe('/POST auth/logout', () => {
    it('it should respond 20x as status code', done => {
      agent.post('/API/auth/logout').end((err, res) => {
        expect(res.statusType).eql(2);
        done();
      });
    });

    it('it should respond 40x as status code', done => {
      const unauthAgent = chai.request.agent(app);
      unauthAgent.post('/API/auth/logout').end((err, res) => {
        expect(res.statusType).eql(4);
        done();
      });
    });
  });
});
