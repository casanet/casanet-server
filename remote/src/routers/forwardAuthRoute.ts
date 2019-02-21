import { Request, Response } from 'express';
import * as express from 'express';
import { ErrorResponse, Login, User } from '../../../backend/src/models/sharedInterfaces';
import { SystemAuthScopes } from '../../../backend/src/security/authentication';
import { RequestSchemaValidator } from '../../../backend/src/security/schemaValidator';
import { ForwardAuthController as ForwardAuthController } from '../controllers/forwardAuthController';
import { ForwardUserSession } from '../models/remoteInterfaces';
import { expressAuthentication } from '../security/authenticationExtend';
import { LoginLocalServerSchema } from '../security/schemaValidatorExtend';

export class ForwardAuthRouter {

    private forwardAuthController: ForwardAuthController;
    constructor() {
        this.forwardAuthController = new ForwardAuthController();
    }

    public routes(app: express.Express): void {

        app.route('/API/auth/login')
            .post(async (req: Request, res: Response) => {
                let loginData: Login;
                try {
                    loginData = await RequestSchemaValidator(req, LoginLocalServerSchema);
                } catch (err) {
                    res.status(422).send();
                    return;
                }

                this.forwardAuthController.login(req, res, loginData)
                    .then(() => {
                        res.send();
                    })
                    .catch(() => {
                        const err: ErrorResponse = {
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
            .post(async (req: Request, res: Response) => {
                let loginData: Login;
                try {
                    loginData = await RequestSchemaValidator(req, LoginLocalServerSchema);
                } catch {
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
            .post(async (req: Request, res: Response) => {

                /**
                 * Make sure it is valid local server user with valid session.
                 */
                const forwardUserSession = await expressAuthentication(req, [SystemAuthScopes.userScope])
                    .catch((error: ErrorResponse) => {
                        res.status(403).send(error);
                    }) as ForwardUserSession;

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
