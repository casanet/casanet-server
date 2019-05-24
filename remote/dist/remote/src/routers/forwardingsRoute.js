"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_1 = require("../../../backend/src/security/authentication");
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
const forwardUserSessionsBl_1 = require("../business-layer/forwardUserSessionsBl");
const forwardingController_1 = require("../controllers/forwardingController");
const authenticationExtend_1 = require("../security/authenticationExtend");
const schemaValidatorExtend_1 = require("../security/schemaValidatorExtend");
const localServersController_1 = require("../controllers/localServersController");
class ForwardingRouter {
    constructor() {
        this.forwardingController = new forwardingController_1.ForwardingController();
        this.localServersController = new localServersController_1.LocalServersController();
    }
    forwardRouter(app) {
        app.put('/API/minions/:minionId/ifttt', async (req, res) => {
            const iftttOnChanged = await schemaValidator_1.RequestSchemaValidator(req, schemaValidatorExtend_1.IftttOnChangedSchema);
            try {
                /** Forward request as is and wait for request. */
                const response = await this.forwardingController.forwardHttpReqByMac(iftttOnChanged.localMac, {
                    requestId: undefined,
                    httpPath: req.originalUrl,
                    httpMethod: req.method.toUpperCase(),
                    httpBody: req.body,
                    httpSession: req.cookies.session,
                });
                /** Set status and data and send response back */
                res.statusCode = response.httpStatus;
                res.send(response.httpBody);
            }
            catch (error) {
                res.status(501).send({ responseCode: 5000 });
            }
        });
        /**
         * Overwrite '/API/remote/status' to return remote server status
         * from the view fo remote server to local server
         */
        app.get('/API/remote/status', async (req, res) => {
            try {
                let forwardUserSession;
                try {
                    /** Make sure, and get valid forward session */
                    forwardUserSession =
                        await authenticationExtend_1.expressAuthentication(req, [authentication_1.SystemAuthScopes.userScope]);
                }
                catch (error) {
                    res.status(401).send({ responseCode: 4001 });
                    return;
                }
                const localServer = await this.localServersController.getLocalServer(forwardUserSession.localServerId);
                const remoteServerStatus = localServer.connectionStatus
                    ? 'connectionOK'
                    : 'localServerDisconnected';
                res.json(remoteServerStatus);
            }
            catch (error) {
                res.status(501).send({ responseCode: 5000 });
            }
        });
        /**
         * Listen to all casa API, to forward request to local server via WS channel.
         */
        app.use('/API/*', async (req, res) => {
            try {
                let forwardUserSession;
                try {
                    /** Make sure, and get valid forward session */
                    forwardUserSession =
                        await authenticationExtend_1.expressAuthentication(req, [authentication_1.SystemAuthScopes.userScope]);
                }
                catch (error) {
                    res.status(401).send({ responseCode: 4001 });
                    return;
                }
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
                res.json(response.httpBody);
            }
            catch (error) {
                res.status(501).send({ responseCode: 5000 });
            }
        });
    }
}
exports.ForwardingRouter = ForwardingRouter;
//# sourceMappingURL=forwardingsRoute.js.map