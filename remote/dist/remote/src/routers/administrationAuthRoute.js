"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = require("../../../backend/src/controllers/authController");
const authentication_1 = require("../../../backend/src/security/authentication");
const authentication_2 = require("../../../backend/src/security/authentication");
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
/** Route login/logout to remote server administation. */
class AdministrationAuthRouter {
    constructor() {
        this.authController = new authController_1.AuthController();
    }
    routes(app) {
        app.route('/API/administration/auth/login')
            .post(async (req, res) => {
            let loginData;
            try {
                loginData = await schemaValidator_1.RequestSchemaValidator(req, schemaValidator_1.LoginSchema);
            }
            catch (_a) {
                res.status(422).send();
                return;
            }
            this.authController.login(req, res, loginData)
                .then(() => {
                res.send();
            })
                .catch(() => {
                if (res.statusCode === 200) {
                    res.statusCode = 501;
                }
                res.send();
            });
        });
        app.route('/API/administration/auth/login/tfa')
            .post(async (req, res) => {
            let loginData;
            try {
                loginData = await schemaValidator_1.RequestSchemaValidator(req, schemaValidator_1.LoginSchema);
            }
            catch (_a) {
                res.status(422).send();
                return;
            }
            this.authController.loginTfa(req, res, loginData)
                .then(() => {
                res.send();
            })
                .catch(() => {
                res.status(403).send();
            });
        });
        app.route('/API/administration/auth/logout')
            .post(async (req, res) => {
            /**
             * Because there is not use in TSOA security, needs to call middelwhere manualy.
             */
            req.user = await authentication_2.expressAuthentication(req, [authentication_1.SystemAuthScopes.adminScope])
                .catch((error) => {
                res.status(403).send(error);
            });
            // If auth fail abort the request
            if (!req.user) {
                res.status(403).send();
                return;
            }
            this.authController.logout(req, res)
                .then(() => {
                res.send();
            })
                .catch(() => {
                res.status(501).send();
            });
        });
    }
}
exports.AdministrationAuthRouter = AdministrationAuthRouter;
//# sourceMappingURL=administrationAuthRoute.js.map