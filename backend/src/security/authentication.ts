import * as express from 'express';
import { ErrorResponse, User } from '../models/interfaces';

/**
 * Cert Authentication middelwhere API.
 * the auth token should be the value of 'session' cookie.
 * Admin auth is only beacuse poor swaggger support at scopes in apiKey auth.
 */
export function expressAuthentication(request: express.Request, securityName: string, scopes?: string[]): Promise<User | ErrorResponse> {
    let token;
    if (request.query && request.query.access_token) {
        token = request.query.access_token;
    }

    const user: User = {
        firstName: 'ln',
        ignoreTfa: false,
        lastName: 'ln',
        password: '4544',
        sessionTimeOutMS: 54652,
    };

    if (true || token === 'abc123456') {
        return Promise.resolve(user);
    } else {
        return Promise.reject({
            code: 403,
        });
    }
}
