import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { logger } from '../../../backend/src/utilities/logger';
import { AuthScopes, ForwardSession } from '../models';
import { ErrorResponse, IftttActionTriggeredRequest } from '../../../backend/src/models/sharedInterfaces';
import { SchemaValidator } from '../../../backend/src/security/schemaValidator';
import { IftttAuthRequestSchema } from './schemaValidator';
import { Configuration } from '../../../backend/src/config';
import { Cache } from '../logic';

export const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    logger.fatal('You must set the jwt secret!');
    process.exit();
}

/**
 * System auth scopes, shown in swagger doc as 2 kinds of security definitions.
 */
export const SystemAuthScopes: {
    forwardScope: AuthScopes,
    adminScope: AuthScopes,
    iftttScope: AuthScopes,
} = {
    forwardScope: 'forwardAuth',
    adminScope: 'adminAuth',
    iftttScope: 'iftttAuth',
};

export const forwardCache = new Cache(
    +process.env.FORWARD_CACHE_TTL || 60 * 60 * 2,
    +process.env.FORWARD_CACHE_CHECK_PERIOD || 60 * 60
);

/**
 * Cert Authentication middelwhere API.
 * the auth token should be the value of 'session' cookie.
 * @param securityName Used as auth scope beacuse of poor scopes swaggger support in apiKey auth.
 */
export const expressAuthentication = async (request: express.Request, scopes: string[]):
    Promise<string | ForwardSession | ErrorResponse> => {

    // If the routing security sent wrong security scope.
    if (!scopes || scopes.length < 1) {
        logger.fatal('invalid or empty security scope');
        throw {
            responseCode: 1501,
        } as ErrorResponse;
    }

    /** TODO: add cache support */

    /** Handle IFTTT requests */
    if (scopes.indexOf(SystemAuthScopes.iftttScope) !== -1) {
        const { apiKey, localMac } = request.body as IftttActionTriggeredRequest;
        await SchemaValidator({ apiKey, localMac }, IftttAuthRequestSchema);
        return;
    }

    /** If the session cookie empty, ther is nothing to check. */
    if (!request.cookies.session) {
        throw {
            responseCode: 1403,
        } as ErrorResponse;
    }

    /** Handle admin JWT tokens */
    if (scopes.indexOf(SystemAuthScopes.adminScope) !== -1) {
        const payload = jwt.verify(request.cookies.session, jwtSecret) as object;
        return payload['email'];
    }

    /** Handle forward JWT tokens */
    if (scopes.indexOf(SystemAuthScopes.forwardScope) !== -1) {
        const payload = jwt.verify(request.cookies.session, jwtSecret) as ForwardSession;
        return payload;
    }

    throw {
        responseCode: 1403,
    } as ErrorResponse;
};
