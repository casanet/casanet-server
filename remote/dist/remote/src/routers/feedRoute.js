"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feed_controller_1 = require("../controllers/feed-controller");
const authentication_1 = require("../security/authentication");
class FeedRouter {
    constructor() {
        this.feedController = new feed_controller_1.FeedController();
    }
    routes(app) {
        app.get('/API/feed/minions', async (request, response) => {
            try {
                /**
                 * Make sure it is valid local server user with valid session.
                 */
                const forwardUserSession = await authentication_1.expressAuthentication(request, [authentication_1.SystemAuthScopes.forwardScope]);
                this.feedController.initMinionsFeed(forwardUserSession.server, request, response);
            }
            catch (error) {
                response.status(401).send();
            }
        });
        app.get('/API/feed/timings', async (request, response) => {
            try {
                /**
                 * Make sure it is valid local server user with valid session.
                 */
                const forwardUserSession = await authentication_1.expressAuthentication(request, [authentication_1.SystemAuthScopes.forwardScope]);
                this.feedController.initTimingsFeed(forwardUserSession.server, request, response);
            }
            catch (error) {
                response.status(401).send();
            }
        });
    }
}
exports.FeedRouter = FeedRouter;
//# sourceMappingURL=feedRoute.js.map