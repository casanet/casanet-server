import { NextFunction, Request, Response } from 'express';
import * as express from 'express';
import { ErrorResponse, IftttActionTriggeredRequest } from '../../../backend/src/models/sharedInterfaces';
import { logger } from '../../../backend/src/utilities/logger';
import { ForwardingController } from '../controllers/forwarding-controller';

export class ForwardingIftttRouter {

    private forwardingController: ForwardingController = new ForwardingController();

    public forwardRouter(app: express.Express): void {

        /** Handle all ifttt triggers requests */
        app.post('/API/ifttt/trigger/*', async (req: Request, res: Response) => {
            const iftttTriggerRequest = req.body as IftttActionTriggeredRequest;

            /** Make sure request contance local server to forward to. */
            if (typeof iftttTriggerRequest !== 'object' || !iftttTriggerRequest.localMac) {
                res.sendStatus(422).send();
                return;
            }

            try {
                /** Forward request as is and wait for request. */
                const response = await this.forwardingController.forwardHttpReq(iftttTriggerRequest.localMac,
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
                logger.debug(`Forwarding ifttt trigger action to local server mac: ${iftttTriggerRequest.localMac},` +
                    `fail ${JSON.stringify(error)}`);
                // Dont tell if its fail becuase of mac not connected or not exist, to avoid attakers to know if mac is valid or not.
                res.status(501).send({ responseCode: 5000 } as ErrorResponse);
            }
        });
    }
}
