"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SseStream = require("express-sse");
const feedController_1 = require("../controllers/feedController");
const authentication_1 = require("../security/authentication");
const logger_1 = require("../utilities/logger");
const authentication_2 = require("./../security/authentication");
class FeedRouter {
    constructor() {
        this.feedController = new feedController_1.FeedController();
    }
    routes(app) {
        /**
         * Feed security middelwhere
         */
        app.use('/API/feed/*', async (req, res, next) => {
            try {
                /**
                 * Because there is no use in TSOA security, needs to call middelwhere manualy.
                 */
                const user = (await authentication_2.expressAuthentication(req, [
                    authentication_1.SystemAuthScopes.userScope,
                    authentication_1.SystemAuthScopes.adminScope,
                ]));
                logger_1.logger.debug(`user ${user.email} connected to feed ${req.path}`);
                next();
            }
            catch (error) {
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
exports.FeedRouter = FeedRouter;
//# sourceMappingURL=feedRoute.js.map