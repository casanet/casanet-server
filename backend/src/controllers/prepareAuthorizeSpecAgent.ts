import * as chai from 'chai';
import chaiHttp = require('chai-http');
import app from '../App';
import { Login, LoginTfa } from '../models/interfaces';

/**
 * Perpare chai session agent.
 */
chai.use(chaiHttp);
const userAgent = chai.request.agent(app);
const adminAgent = chai.request.agent(app);

/**
 * The valied login schema model.
 */
const loginSchema: Login = {
    email: 'aa@bb.com',
    password: '1234',
};

/**
 * Login to system then the load session agent can be used
 * in other spec's to check thire tests.
 */
userAgent.post('/API/auth/login')
    .send(loginSchema)
    .end((err, res) => {
        if (err || res.statusType !== 2) {
            console.error('Perpare  user agent fail, all API tests specs that need user certs will fail too.');
        }
    });

/**
 * Same as user agent just in admin certs.
 */
adminAgent.post('/API/auth/login')
    .send(loginSchema)
    .end((err, res) => {
        if (err || res.statusType !== 2) {
            console.error('Perpare agent fail, all API tests specs that need admin certs will fail too.');
        }
    });

/**
 * API
 */
export const validUserAgent = userAgent;
export const validAdminAgent = adminAgent;
