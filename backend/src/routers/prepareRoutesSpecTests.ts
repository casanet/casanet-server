import * as chai from 'chai';
import chaiHttp = require('chai-http');
import app from '../App';
import { UsersDalSingleton } from '../data-layer/usersDal';
import { Login, LoginTfa } from '../models/sharedInterfaces';
import { User } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

/**
 * Perpare chai session agent.
 */
chai.use(chaiHttp);
const userAgent = chai.request.agent(app);
const adminAgent = chai.request.agent(app);

/**
 * Reset data, for testing all system flow.
 */
const signInUser: User = {
    email: 'aa@bb.com',
    firstName: 'firstName1',
    ignoreTfa: true,
    password: '1234',
    sessionTimeOutMS: 123454321100000,
};

/**
 * Hold keys in struct for export by ref and not by val.
 */
const sessionKey: { userSessionKey?: string, adminSessionKey?: string } = {};

/**
 * Create user to login to it, and then all system specs can use it in as routing cert.
 */
UsersDalSingleton.createUser(signInUser)
    .then(() => {

        /**
         * The valied login schema model.
         */
        const loginSchema: Login = {
            email: signInUser.email,
            password: signInUser.password,
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
                } else {
                    const cookie: string = res['headers']['set-cookie'][0] as string;
                    sessionKey.userSessionKey = cookie.split(';')[0].split('=')[1];
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
                } else {
                    const cookie: string = res['headers']['set-cookie'][0] as string;
                    sessionKey.adminSessionKey = cookie.split(';')[0].split('=')[1];
                }
            });

    });

/**
 * API
 */

/**
 * A valid user object.
 */
export const validSystemUser = signInUser;

/**
 * A valid user (with admin premission) object.
 */
export const validSystemAdmin = signInUser;

/**
 * A valid sessions cookie session key.
 */
export const validSession = sessionKey;

/**
 * An express test agent with valid cookie as user.
 */
export const validUserAgent = userAgent;

/**
 * An express test agent with valid cookie as admin.
 */
export const validAdminAgent = adminAgent;
