import * as express from 'express';
import { AuthScopes } from '../models/config';
import { ErrorResponse, User } from '../models/interfaces';

/**
 * System auth scopes, shown in swagger doc as 2 kinds of security definitions.
 */
export const SystemAuthScopes: AuthScopes = {
    adminScope: 'adminAuth',
    userScope: 'userAuth',
};

/**
 * Cert Authentication middelwhere API.
 * the auth token should be the value of 'session' cookie.
 * @param securityName Used as auth scope beacuse of poor scopes swaggger support in apiKey auth.
 */
export function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<User | ErrorResponse> {

    // If the routing security sent wrong security scope.
    if (!securityName || Object.values(SystemAuthScopes).indexOf(securityName) === -1) {
        throw new Error('invalid security scope / name');
    }

    const user: User = {
        firstName: 'ln',
        ignoreTfa: false,
        lastName: 'ln',
        password: '4544',
        sessionTimeOutMS: 54652,
    };

    if (request.cookies.session === 'abc123456') {
        return Promise.resolve(user);
    } else {
        return Promise.reject({
            code: 403,
        });
    }
}
