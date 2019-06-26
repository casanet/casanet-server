import { Request, Response } from 'express';
import * as express from 'express';
import { ErrorResponse, IftttOnChanged, RemoteConnectionStatus } from '../../../backend/src/models/sharedInterfaces';
import { RequestSchemaValidator } from '../../../backend/src/security/schemaValidator';
import { logger } from '../../../backend/src/utilities/logger';
import { ForwardingController } from '../controllers/forwarding-controller';
import { ForwardSession } from '../models';
import { expressAuthentication, SystemAuthScopes } from '../security/authentication';
import { IftttOnChangedSchema } from '../security/schemaValidator';
import { LocalServersController } from '../controllers/local-servers-controller';
import { ChannelsBlSingleton } from '../logic';
import { deleteForwardSession } from '../data-access';
import { Configuration } from '../../../backend/src/config';

export class ForwardingRouter {

    private forwardingController: ForwardingController = new ForwardingController();
    private localServersController: LocalServersController = new LocalServersController();

    public forwardRouter(app: express.Express): void {

        app.put('/API/minions/:minionId/ifttt', async (req: Request, res: Response) => {
            const iftttOnChanged = await RequestSchemaValidator(req, IftttOnChangedSchema) as IftttOnChanged;

            try {
                /** Forward request as is and wait for request. */
                const response = await this.forwardingController.forwardHttpReq(iftttOnChanged.localMac,
                    {
                        requestId: undefined,
                        httpPath: req.originalUrl,
                        httpMethod: req.method.toUpperCase(),
                        httpBody: req.body,
                        httpSession: req.cookies.session,
                    });

                /** Set status and data and send response back */
                res.statusCode = response.httpStatus;
                res.send(response.httpBody);

            } catch (error) {
                res.status(501).send({ responseCode: 5000 } as ErrorResponse);
            }
        });

        /** 
         * Overwrite '/API/remote/status' to return remote server status 
         * from the view fo remote server to local server 
         */
        app.get('/API/remote/status', async (req: Request, res: Response) => {
            try {
                let forwardUserSession: ForwardSession;
                try {
                    /** Make sure, and get valid forward session */
                    forwardUserSession =
                        await expressAuthentication(req, [SystemAuthScopes.forwardScope]) as ForwardSession;
                } catch (error) {
                    res.status(401).send({ responseCode: 4001 } as ErrorResponse);
                    return;
                }

                const remoteServerStatus: RemoteConnectionStatus = await ChannelsBlSingleton.connectionStatus(forwardUserSession.server.macAddress)
                    ? 'connectionOK'
                    : 'localServerDisconnected';

                res.json(remoteServerStatus);

            } catch (error) {
                res.status(501).send({ responseCode: 5000 } as ErrorResponse);
            }

        });
        /**
         * Listen to all casa API, to forward request to local server via WS channel.
         */
        app.use('/API/*', async (req: Request, res: Response) => {
            try {
                let forwardUserSession: ForwardSession;
                try {
                    /** Make sure, and get valid forward session */
                    forwardUserSession =
                        await expressAuthentication(req, [SystemAuthScopes.forwardScope]) as ForwardSession;
                } catch (error) {
                    res.status(401).send({ responseCode: 4001 } as ErrorResponse);
                    return;
                }

                /** Forward request as is and wait for request. */
                const response = await this.forwardingController.forwardHttpReq(forwardUserSession.server.macAddress,
                    {
                        requestId: undefined,
                        httpPath: req.originalUrl,
                        httpMethod: req.method.toUpperCase(),
                        httpBody: req.body,
                        httpSession: req.cookies.session,
                    });

                /** If status is 403, delete forward session too. */
                if (response.httpStatus === 403) {
                    try { await deleteForwardSession(forwardUserSession.hashedKey); } catch (error) { }
                }

                /** Set status and data and send response back */
                res.statusCode = response.httpStatus;
                res.json(response.httpBody);
            } catch (error) {
                res.status(501).send({ responseCode: 5000 } as ErrorResponse);
            }
        });
    }
}
