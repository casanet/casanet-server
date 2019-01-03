import { Request, Response } from 'express';
import * as express from 'express';
import { AuthController } from '../controllers/authController';
import { ErrorResponse, Login, LoginTfa, User } from '../models/sharedInterfaces';
import { SystemAuthScopes } from '../security/authentication';
import { LoginSchema, schemaValidator, TfaSchema } from '../security/schemaValidator';
import { expressAuthentication } from './../security/authentication';

export class AuthenticationRouter {

    private authController: AuthController;
    constructor() {
        this.authController = new AuthController();
    }

    public routes(app: express.Express): void {

        app.route('/API/auth/login')
            .post(async (req: Request, res: Response) => {
                let loginData: Login;
                try {
                    loginData = await schemaValidator(req, LoginSchema);
                } catch {
                    res.status(422).send();
                    return;
                }

                this.authController.login(req, res, loginData)
                    .then(() => {
                        res.send();
                    })
                    .catch(() => {
                        const err: ErrorResponse = {
                            code: 403,
                        };
                        if (res.statusCode === 200) {
                            res.statusCode = 501;
                            err.code = 501;
                        }
                        res.send(err);
                    });
            });

        app.route('/API/auth/login/tfa')
            .post(async (req: Request, res: Response) => {
                let loginData: LoginTfa;
                try {
                    loginData = await schemaValidator(req, TfaSchema);
                } catch {
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

        app.route('/API/auth/logout')
            .post(async (req: Request, res: Response) => {

                /**
                 * Because there is not use in TSOA security, needs to call middelwhere manualy.
                 */
                req.user = await expressAuthentication(req, SystemAuthScopes.userScope)
                    .catch((error: ErrorResponse) => {
                        res.status(403).send(error);
                    }) as User;

                // If auth fail abort the request
                if (!req.user) {
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
