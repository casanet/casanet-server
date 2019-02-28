import * as express from 'express';
import { Application, NextFunction, Request, Response } from 'express';
import { AuthScopes, ErrorResponse, User } from '../../../backend/src/models/sharedInterfaces';
import { expressAuthentication as localExpressAuthentication, SystemAuthScopes } from '../../../backend/src/security/authentication';
import { logger } from '../../../backend/src/utilities/logger';
import { ForwardUsersSessionsBlSingleton } from '../business-layer/forwardUserSessionsBl';
import { ForwardUserSession } from '../models/remoteInterfaces';

/**
 * Cert Authentication middelwhere API.
 * the auth token should be the value of 'session' cookie.
 * @param securityName Used as auth scope beacuse of poor scopes swaggger support in apiKey auth.
 */
export const expressAuthentication = async (request: express.Request, scopes: string[]):
    Promise<User | ForwardUserSession | ErrorResponse> => {

    // If the routing security sent wrong security scope.
    if (!scopes || scopes.length < 1) {
        logger.fatal('invalid or empty security scope');
        throw {
            responseCode: 1501,
        } as ErrorResponse;
    }

    /** If the session cookie empty, ther is nothing to check. */
    if (!request.cookies.session) {
        throw {
            responseCode: 1403,
        } as ErrorResponse;
    }

    try {

        /**
         * If scope it`s not for users, it mean that request should be from managment admin user, so use regular authentication middlewhere
         */
        if (scopes.indexOf(SystemAuthScopes.userScope) === -1) {
            return await localExpressAuthentication(request, scopes);
        }

        /** Else, if it`s a user scope, it mean that request should be from local server user, so check if forward session exist */
        return await ForwardUsersSessionsBlSingleton.getSession(request.cookies.session);
    } catch (error) {
        throw {
            responseCode: 1403,
        } as ErrorResponse;
    }
};
