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
            try {
                const apiResData = await this.forwardAuthController.login(req, res, loginData);
                /** Case error is planned (and not some inner error that was thrown from somewhere) return it to client. */
                res.send(apiResData);
            }
            catch (error) {
                /** Any other unplanned error, don't send to the client any clue about it. */
                res.status(403).send();
            }
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
            try {
                const apiError = await this.forwardAuthController.loginTfa(req, res, loginData);
                /** Case error is planned (and not some inner error that was thrown from somewhere) return it to client. */
                res.send(apiError);
            }
            catch (error) {
                /** Any other unplanned error, don't send to the client any clue about it. */
                res.status(403).send();
            }
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