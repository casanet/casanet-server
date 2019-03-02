"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_1 = require("../../../backend/src/security/authentication");
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
const forwardAuthController_1 = require("../controllers/forwardAuthController");
const authenticationExtend_1 = require("../security/authenticationExtend");
const schemaValidatorExtend_1 = require("../security/schemaValidatorExtend");
class ForwardAuthRouter {
    constructor() {
        this.forwardAuthController = new forwardAuthController_1.ForwardAuthController();
    }
    routes(app) {
        app.route('/API/auth/login')
            .post(async (req, res) => {
            let loginData;
            try {
                loginData = await schemaValidator_1.RequestSchemaValidator(req, schemaValidatorExtend_1.LoginLocalServerSchema);
            }
            catch (err) {
                res.status(422).send();
                return;
            }
            this.forwardAuthController.login(req, res, loginData)
                .then(() => {
                res.send();
            })
                .catch(() => {
                const err = {
                    responseCode: 403,
                };
                if (res.statusCode === 200) {
                    res.statusCode = 501;
                    err.responseCode = 501;
                }
                res.send(err);
            });
        });
        app.route('/API/auth/login/tfa')
            .post(async (req, res) => {
            let loginData;
            try {
                loginData = await schemaValidator_1.RequestSchemaValidator(req, schemaValidatorExtend_1.LoginLocalServerSchema);
            }
            catch (_a) {
                res.status(422).send();
                return;
            }
            this.forwardAuthController.loginTfa(req, res, loginData)
                .then(() => {
                res.send();
            })
                .catch(() => {
                res.status(403).send();
            });
        });
        app.route('/API/auth/logout')
            .post(async (req, res) => {
            /**
             * Make sure it is valid local server user with valid session.
             */
            const forwardUserSession = await authenticationExtend_1.expressAuthentication(req, [authentication_1.SystemAuthScopes.userScope])
                .catch((error) => {
                res.status(403).send(error);
            });
            // If auth fail abort the request
            if (!forwardUserSession) {
                res.status(403).send();
                return;
            }
            this.forwardAuthController.logout(req, res, forwardUserSession)
                .then(() => {
                res.send();
            })
                .catch(() => {
                res.status(501).send();
            });
        });
    }
}
exports.ForwardAuthRouter = ForwardAuthRouter;
//# sourceMappingURL=forwardAuthRoute.js.map