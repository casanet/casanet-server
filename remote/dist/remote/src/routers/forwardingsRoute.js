"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_1 = require("../../../backend/src/security/authentication");
const forwardUserSessionsBl_1 = require("../business-layer/forwardUserSessionsBl");
const forwardingController_1 = require("../controllers/forwardingController");
const authenticationExtend_1 = require("../security/authenticationExtend");
class ForwardingRouter {
    constructor() {
        this.forwardingController = new forwardingController_1.ForwardingController();
    }
    forwardRouter(app) {
        /**
         * Listen to all casa API, to forward request to local server via WS channel.
         */
        app.use('/API/*', async (req, res) => {
            try {
                /** Make sure, and get valid forward session */
                const forwardUserSession = await authenticationExtend_1.expressAuthentication(req, [authentication_1.SystemAuthScopes.userScope]);
                /** Forward request as is and wait for request. */
                const response = await this.forwardingController.forwardHttpReq(forwardUserSession.localServerId, {
                    requestId: undefined,
                    httpPath: req.originalUrl,
                    httpMethod: req.method.toUpperCase(),
                    httpBody: req.body,
                    httpSession: req.cookies.session,
                });
                /** If status is 403, delete forward session too. */
                if (response.httpStatus === 403) {
                    try {
                        await forwardUserSessionsBl_1.ForwardUsersSessionsBlSingleton.deleteSession(forwardUserSession);
                    }
                    catch (error) { }
                }
                /** Set status and data and send response back */
                res.statusCode = response.httpStatus;
                res.send(response.httpBody);
            }
            catch (error) {
                res.status(501).send();
            }
        });
    }
}
exports.ForwardingRouter = ForwardingRouter;
//# sourceMappingURL=forwardingsRoute.js.map