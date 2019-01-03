import { Request, Response } from 'express';
import * as express from 'express';
import { Configuration } from '../app.config';
import { ISessionDataLayer, IUsersDataLayer } from '../models/backendInterfaces';
import { ErrorResponse, Login, User } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { SessionsBl } from './sessionsBl';
import { UsersBl } from './usersBl';

export class AuthBl {

    private sessionsBl: SessionsBl;
    private usersBl: UsersBl;

    /**
     * Init auth bl. using dependecy injection pattern to allow units testings.
     * @param usersDal Inject the user dal instalce to used userBl.
     * @param sessionsDal Inject the sessions dal instalce to used sessionBl.
     */
    constructor(usersDal: IUsersDataLayer, sessionsDal: ISessionDataLayer) {

        this.sessionsBl = new SessionsBl(sessionsDal);
        this.usersBl = new UsersBl(usersDal);
    }

    /**
     * Login to system.
     */
    public async login(response: express.Response, login: Login): Promise<void> {

        const errorResponse: ErrorResponse = {
            code: 403,
            message: 'user name or password incorrent',
        };

        const user = await this.usersBl.getUser(login.email)
            .catch(() => {
                logger.info(`login email ${login.email} fail, invalid cert`);
                response.statusCode = 403;
                throw errorResponse;
            });

        if (login.password === user.password) {
            const session = await this.sessionsBl.generateSession(user);

            /**
             * Finally load session on cookies response.
             */
            response.cookie('session', session.key, {
                sameSite: true,
                httpOnly: true, // minimize risk of XSS attacks by restricting the client from reading the cookie
                secure: Configuration.http.useHttps, // only send cookie over https
                maxAge: user.sessionTimeOutMS,
            });
        } else {
            response.statusCode = 403;
            throw errorResponse;
        }
    }
}
