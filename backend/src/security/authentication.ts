import * as express from 'express';
import { Application, NextFunction, Request, Response } from 'express';
import { SessionsBl } from '../business-layer/sessionsBl';
import { UsersBl } from '../business-layer/usersBl';
import { SessionsDalSingelton } from '../data-layer/sessionsDal';
import { UsersDalSingleton } from '../data-layer/usersDal';
import { AuthScopes, Session } from '../models/backendInterfaces';
import { ErrorResponse, User } from '../models/sharedInterfaces';

const usersBl: UsersBl = new UsersBl(UsersDalSingleton);
const sessionsBl: SessionsBl = new SessionsBl(SessionsDalSingelton);

/**
 * System auth scopes, shown in swagger doc as 2 kinds of security definitions.
 */
export const SystemAuthScopes: AuthScopes = {
    adminScope: 'adminAuth',
    userScope: 'userAuth',
};

/**
 * Get request client IP.
 */
export function getIp(req: Request): string {
    let ip = req.headers['x-forwarded-for'] as string;
    if (ip) {
        const ipParts = ip.split(',');
        ip = ipParts[ipParts.length - 1];
    } else {
        ip = req.connection.remoteAddress;
    }
    return ip;
}

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

    return new Promise((resolve, reject) => {
        sessionsBl.getSession(request.cookies.session)
            .then((session: Session) => {
                usersBl.getUser(session.email)
                    .then((user: User) => {
                        // TODO : check scope!!!
                        resolve(user);
                    })
                    .catch(() => {
                        reject({
                            code: 403,
                        });
                    });
            })
            .catch((err) => {
                reject({
                    code: 403,
                });
            });
    });
}
