import { NextFunction, Request, Response } from 'express';
import * as express from 'express';
import * as SseStream from 'express-sse';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
import { SystemAuthScopes } from '../../../backend/src/security/authentication';
import { logger } from '../../../backend/src/utilities/logger';
import { ForwardUsersSessionsBlSingleton } from '../business-layer/forwardUserSessionsBl';
import { ForwardingController } from '../controllers/forwardingController';
import { ForwardUserSession } from '../models/remoteInterfaces';
import { expressAuthentication } from '../security/authenticationExtend';

export class ForwardingRouter {

    private forwardingController: ForwardingController = new ForwardingController();

    public forwardRouter(app: express.Express): void {

        /**
         * Listen to all casa API, to forward request to local server via WS channel.
         */
        app.use('/API/*', async (req: Request, res: Response) => {
            try {
                let forwardUserSession: ForwardUserSession;
                try {
                    /** Make sure, and get valid forward session */
                    forwardUserSession =
                        await expressAuthentication(req, [SystemAuthScopes.userScope]) as ForwardUserSession;
                } catch (error) {
                    res.status(401).send({ responseCode: 4001 } as ErrorResponse);
                    return;
                }

                /** Forward request as is and wait for request. */
                const response = await this.forwardingController.forwardHttpReq(forwardUserSession.localServerId,
                    {
                        requestId: undefined,
                        httpPath: req.originalUrl,
                        httpMethod: req.method.toUpperCase(),
                        httpBody: req.body,
                        httpSession: req.cookies.session,
                    });

                /** If status is 403, delete forward session too. */
                if (response.httpStatus === 403) {
                    try { await ForwardUsersSessionsBlSingleton.deleteSession(forwardUserSession); } catch (error) { }
                }

                /** Set status and data and send response back */
                res.statusCode = response.httpStatus;
                res.send(response.httpBody);
            } catch (error) {
                res.status(501).send({ responseCode: 5000 } as ErrorResponse);
            }
        });
    }
}
