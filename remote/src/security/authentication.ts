import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import { logger } from '../../../backend/src/utilities/logger';
import { ForwardSession, RemoteAdmin } from '../models';
import { ErrorResponse, IftttActionTriggeredRequest } from '../../../backend/src/models/sharedInterfaces';
import { AuthScopes } from '../models/sharedInterfaces';
import { jwtSecret } from '../controllers/administration-auth-controller';
import { SchemaValidator } from '../../../backend/src/security/schemaValidator';
import { IftttAuthRequestSchema } from './schemaValidator';
import { getForwardSession } from '../data-access';
import * as cryptoJs from 'crypto-js';
import { Configuration } from '../../../backend/src/config';

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
    }

    /** If the session cookie empty, ther is nothing to check. */
    if (!request.cookies.session) {
        throw {
            responseCode: 1403,
        } as ErrorResponse;
    }

    /** Handle JWT tokens */
    if (scopes.indexOf(SystemAuthScopes.adminScope) !== -1) {
        const payload = jwt.verify(request.cookies.session, jwtSecret) as object;
        return payload['email'];
    }


    /** Handle Forward requests */
    const session = await getForwardSession(cryptoJs.SHA512(request.cookies.session + Configuration.keysHandling.saltHash).toString());
    if(session){
        return session;
    }
    throw {
        responseCode: 1403,
    } as ErrorResponse;
};
