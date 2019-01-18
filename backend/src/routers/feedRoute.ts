import { Request, Response, NextFunction } from 'express';
import * as express from 'express';
import { ErrorResponse, Login, LoginTfa, User } from '../models/sharedInterfaces';
import { SystemAuthScopes } from '../security/authentication';
import { expressAuthentication } from './../security/authentication';
import * as SseStream from 'express-sse'
import { logger } from '../utilities/logger';
import { FeedController } from '../controllers/feedController';

export class FeedRouter {

    private feedController: FeedController = new FeedController();


    public routes(app: express.Express): void {

        /**
         * Feed security middelwhere
         */
        app.use('/API/feed/*', async (req: Request, res: Response, next: NextFunction) => {
            try {
                /**
                 * Because there is no use in TSOA security, needs to call middelwhere manualy.
                 */
                const user = await expressAuthentication(req, [SystemAuthScopes.userScope]) as User;
                logger.info(`user ${user.email} connected to feed ${req.path}`);

                next();
            } catch (error) {
                res.status(403).send();
            }
        });

        /**
         * Init the sse objects.
         */
        var minionsSseFeed = new SseStream(['init'], { isSerialized: true });
        var timingsSseFeed = new SseStream(['init'], { isSerialized: true });

        /**
         * SSE minions feed.
         */
        app.get('/API/feed/minions', minionsSseFeed.init);

        /**
         * SSE timings feed.
         */
        app.get('/API/feed/timings', timingsSseFeed.init);

        /**
         * After all routings init send sseFeed objects to feed controller
         */
        this.feedController.initMinionsFeed(minionsSseFeed);
        this.feedController.initTimingsFeed(timingsSseFeed);
    }
}
