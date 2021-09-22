import { NextFunction, Request, Response } from 'express';
import * as express from 'express';
import * as SseStream from 'express-sse';
import { FeedController } from '../controllers/feedController';
import { ErrorResponse, Login, User } from '../models/sharedInterfaces';
import { AUTHENTICATION_HEADER, SystemAuthScopes, verifyBySecurity } from '../security/authentication';
import { logger } from '../utilities/logger';

export class FeedRouter {
	private feedController: FeedController = new FeedController();

	public routes(app: express.Express): void {
		/**
		 * Feed security middleware
		 */
		app.use('/API/feed/*', async (req: Request, res: Response, next: NextFunction) => {
			try {
				/** 
				 * Allow send the authentication key via query in SSE (only)
				 * - used when not using cookies but authentication header as authorization for REST request
				 */
				if (req.query[AUTHENTICATION_HEADER]) {
					req.headers[AUTHENTICATION_HEADER] = req.query[AUTHENTICATION_HEADER] as any;
				}
				const user = (await verifyBySecurity(req, [
					SystemAuthScopes.userScope,
					SystemAuthScopes.adminScope,
				])) as User;
				// logger.debug(`user ${user.email} connected to feed ${req.path}`);

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
