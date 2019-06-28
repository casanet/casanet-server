import { NextFunction, Request, Response } from 'express';
import * as express from 'express';
import { ErrorResponse, Login, User } from '../../../backend/src/models/sharedInterfaces';
import { logger } from '../../../backend/src/utilities/logger';
import { FeedController } from '../controllers/feed-controller';
import { expressAuthentication, SystemAuthScopes } from '../security/authentication';
import { ForwardSession } from '../models';

export class FeedRouter {

    private feedController: FeedController = new FeedController();

    public routes(app: express.Express): void {

        app.get('/API/feed/minions', async (request: express.Request, response: express.Response) => {
            try {
                /**
                 * Make sure it is valid local server user with valid session.
                 */
                const forwardUserSession =
                    await expressAuthentication(request, [SystemAuthScopes.forwardScope]) as ForwardSession;

                this.feedController.initMinionsFeed(forwardUserSession.server, request, response);
            } catch (error) {
                response.status(401).send();
            }
        });

        app.get('/API/feed/timings', async (request: express.Request, response: express.Response) => {
            try {
                /**
                 * Make sure it is valid local server user with valid session.
                 */
                const forwardUserSession =
                    await expressAuthentication(request, [SystemAuthScopes.forwardScope]) as ForwardSession;

                this.feedController.initTimingsFeed(forwardUserSession.server, request, response);
            } catch (error) {
                response.status(401).send();
            }
        });

    }
}
