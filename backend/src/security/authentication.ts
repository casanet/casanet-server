import * as express from 'express';
import { Application, NextFunction, Request, Response } from 'express';
import { SessionsBl } from '../business-layer/sessionsBl';
import { UsersBl } from '../business-layer/usersBl';
import { SessionsDalSingelton } from '../data-layer/sessionsDal';
import { UsersDalSingleton } from '../data-layer/usersDal';
import { Session } from '../models/backendInterfaces';
import { AuthScopes, ErrorResponse, User } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

const usersBl: UsersBl = new UsersBl(UsersDalSingleton);
const sessionsBl: SessionsBl = new SessionsBl(SessionsDalSingelton);

/**
 * System auth scopes, shown in swagger doc as 2 kinds of security definitions.
 */
export const SystemAuthScopes: {
    adminScope: AuthScopes,
    userScope: AuthScopes,
} = {
    adminScope: 'adminAuth',
    userScope: 'userAuth',
};

/**
 * Cert Authentication middelwhere API.
 * the auth token should be the value of 'session' cookie.
 * @param securityName Used as auth scope beacuse of poor scopes swaggger support in apiKey auth.
 */
export const expressAuthentication = async (request: express.Request, scopes: string[]): Promise<User | ErrorResponse> => {

    // If the routing security sent wrong security scope.
    if (!scopes || scopes.length < 1) {
        logger.fatal('invalid or empty security scope');
        throw {
            responseCode: 5001,
        } as ErrorResponse;
    }

    // If the session cookie empty, ther is nothing to check.
    if (!request.cookies.session) {
        throw {
            responseCode: 4003,
        } as ErrorResponse;
    }

    try {

        const session = await sessionsBl.getSession(request.cookies.session);
        const user = await usersBl.getUser(session.email);

        /**
         * Make sure that session not expired.
         */
        if ((new Date().getTime() - session.timeStamp) > user.sessionTimeOutMS) {
            await sessionsBl.deleteSession(session);
            throw {
                responseCode: 4003,
            } as ErrorResponse;
        }

        /**
         * Pass only in user scope in requierd scopes and the scope is valid.
         */
        if (scopes.indexOf(user.scope) !== -1 &&
            Object.values(SystemAuthScopes).indexOf(user.scope) !== -1) {
            return user;
        }

        logger.info(`user ${user.email} try to access ${request.method} ${request.path} above his scope ${user.scope}`);
        throw {
            responseCode: 4003,
        } as ErrorResponse;
    } catch (error) {
        throw {
            responseCode: 4003,
        } as ErrorResponse;
    }
};
