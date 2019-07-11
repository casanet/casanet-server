"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
const forwarding_controller_1 = require("../controllers/forwarding-controller");
const local_servers_controller_1 = require("../controllers/local-servers-controller");
const logic_1 = require("../logic");
const authentication_1 = require("../security/authentication");
const schemaValidator_2 = require("../security/schemaValidator");
class ForwardingRouter {
    constructor() {
        this.forwardingController = new forwarding_controller_1.ForwardingController();
        this.localServersController = new local_servers_controller_1.LocalServersController();
    }
    forwardRouter(app) {
        app.put('/API/minions/:minionId/ifttt', async (req, res) => {
            const iftttOnChanged = await schemaValidator_1.RequestSchemaValidator(req, schemaValidator_2.IftttOnChangedSchema);
            try {
                /** Forward request as is and wait for request. */
                const response = await this.forwardingController.forwardHttpReq(iftttOnChanged.localMac, {
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
                        await authentication_1.expressAuthentication(req, [authentication_1.SystemAuthScopes.forwardScope]);
                }
                catch (error) {
                    res.status(401).send({ responseCode: 4001 });
                    return;
                }
                const remoteServerStatus = await logic_1.ChannelsSingleton.connectionStatus(forwardUserSession.server)
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
                        await authentication_1.expressAuthentication(req, [authentication_1.SystemAuthScopes.forwardScope]);
                }
                catch (error) {
                    res.status(401).send({ responseCode: 4001 });
                    return;
                }
                /** Forward request as is and wait for request. */
                const response = await this.forwardingController.forwardHttpReq(forwardUserSession.server, {
                    requestId: undefined,
                    httpPath: req.originalUrl,
                    httpMethod: req.method.toUpperCase(),
                    httpBody: req.body,
                    httpSession: forwardUserSession.session,
                });
                /** If status is 403, add it to token black list too. */
                if (response.httpStatus === 403) {
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