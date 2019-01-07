import * as express from 'express';
import { Configuration } from '../config';
import { ErrorResponse, Login, User } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { SessionsBl, SessionsBlSingleton } from './sessionsBl';
import { UsersBl, UsersBlSingleton } from './usersBl';

export class AuthBl {

    private sessionsBl: SessionsBl;
    private usersBl: UsersBl;

    /**
     * Init auth bl. using dependecy injection pattern to allow units testings.
     * @param sessionsBl Inject the sessions bl instalce to used sessionBl.
     * @param usersBl Inject the user bl instalce to used userBl.
     */
    constructor(sessionsBl: SessionsBl, usersBl: UsersBl) {

        this.sessionsBl = sessionsBl;
        this.usersBl = usersBl;
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

export const AuthBlSingleton = new AuthBl(SessionsBlSingleton, UsersBlSingleton);
