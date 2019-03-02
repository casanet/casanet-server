"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_1 = require("../../../backend/src/security/authentication");
const feedController_1 = require("../controllers/feedController");
const authenticationExtend_1 = require("../security/authenticationExtend");
class FeedRouter {
    constructor() {
        this.feedController = new feedController_1.FeedController();
    }
    routes(app) {
        app.get('/API/feed/minions', async (request, response) => {
            try {
                /**
                 * Make sure it is valid local server user with valid session.
                 */
                const forwardUserSession = await authenticationExtend_1.expressAuthentication(request, [authentication_1.SystemAuthScopes.userScope]);
                this.feedController.initMinionsFeed(forwardUserSession.localServerId, request, response);
            }
            catch (error) {
                response.status(403).send();
            }
        });
        app.get('/API/feed/timings', async (request, response) => {
            try {
                /**
                 * Make sure it is valid local server user with valid session.
                 */
                const forwardUserSession = await authenticationExtend_1.expressAuthentication(request, [authentication_1.SystemAuthScopes.userScope]);
                this.feedController.initTimingsFeed(forwardUserSession.localServerId, request, response);
            }
            catch (error) {
                response.status(403).send();
            }
        });
    }
}
exports.FeedRouter = FeedRouter;
//# sourceMappingURL=feedRoute.js.map