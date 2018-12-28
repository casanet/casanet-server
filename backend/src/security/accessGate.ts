import { Application, NextFunction, Request, Response } from 'express';
import { logger } from '../utilities/logger';

export class SecurityGate {

    /** Get the IP of request */
    public static getIp(req: Request): string {
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
     * Get string info / meta about request.
     * @param req
     */
    private requestToString(req: Request): string {
        const session = req.cookies.session;
        return ', INFO: IP: ' + SecurityGate.getIp(req) + ',    SESSION_ID: ' + session + ',    REQUEST: ' + req.method + ' ' + req.url;
    }

    /**
     * Check the request session.
     * @param sessionKey session cert.
     * @param req The request.
     */
    private async checkSessionValidation(sessionKey: string, req: Request): Promise<void> {
        // TODO check the certificate, and abort the request if invalid..
    }

    /**
     * Check request certifications.
     * @param app An express app.
     */
    public checkAccess(app: Application): void {

        app.use((req: Request, res: Response, next: NextFunction) => {
            /** If the request is *not* for API, but it for login or static files */
            if (req.url === '/' ||
                req.url.indexOf('/v1/') === 0 ||
                req.url === '/login' &&
                req.url.indexOf('/API/') === -1) { // it login logout or static file continue
                next();
                return;
            }

            /** If it will pass the validation let the request continue to API routing */
            this.checkSessionValidation(req.cookies.session, req)
                .then(() => {
                    next();
                })
                .catch((err: Error) => {
                    logger.info(`Request access forbidden ${this.requestToString(req)}, because ${err.message}`);
                    res.status(403).send();
                });
        });
    }
}
