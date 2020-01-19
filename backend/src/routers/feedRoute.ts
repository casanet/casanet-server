import { NextFunction, Request, Response } from 'express';
import * as express from 'express';
import * as SseStream from 'express-sse';
import { FeedController } from '../controllers/feedController';
import { ErrorResponse, Login, User } from '../models/sharedInterfaces';
import { SystemAuthScopes } from '../security/authentication';
import { logger } from '../utilities/logger';
import { expressAuthentication } from './../security/authentication';

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
        const user = (await expressAuthentication(req, [
          SystemAuthScopes.userScope,
          SystemAuthScopes.adminScope,
        ])) as User;
        logger.debug(`user ${user.email} connected to feed ${req.path}`);

        next();
      } catch (error) {
        res.status(403).send();
      }
    });

    /**
     * Init the sse objects.
     */
    const minionsSseFeed = new SseStream(['init'], { isSerialized: true });
    const timingsSseFeed = new SseStream(['init'], { isSerialized: true });

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
