import { NextFunction, Request, Response } from 'express';
import * as express from 'express';
import { ErrorResponse, Login, User } from '../../../backend/src/models/sharedInterfaces';
import { SystemAuthScopes } from '../../../backend/src/security/authentication';
import { logger } from '../../../backend/src/utilities/logger';
import { FeedController } from '../controllers/feed-controller';
import { ForwardSession } from '../models';
import { expressAuthentication } from '../security/authentication';

export class FeedRouter {

    private feedController: FeedController = new FeedController();

    public routes(app: express.Express): void {

        app.get('/API/feed/minions', async (request: express.Request, response: express.Response) => {
            try {
                /**
                 * Make sure it is valid local server user with valid session.
                 */
                const forwardUserSession =
                    await expressAuthentication(request, [SystemAuthScopes.userScope]) as ForwardSession;

                this.feedController.initMinionsFeed(forwardUserSession.server.macAddress, request, response);
            } catch (error) {
                response.status(403).send();
            }
        });

        app.get('/API/feed/timings', async (request: express.Request, response: express.Response) => {
            try {
                /**
                 * Make sure it is valid local server user with valid session.
                 */
                const forwardUserSession =
                    await expressAuthentication(request, [SystemAuthScopes.userScope]) as ForwardSession;

                this.feedController.initTimingsFeed(forwardUserSession.server.macAddress, request, response);
            } catch (error) {
                response.status(403).send();
            }
        });

    }
}
