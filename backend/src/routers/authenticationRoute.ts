import { Request, Response } from 'express';
import * as express from 'express';
import { AuthController } from '../controllers/authController';
import { Login, LoginTfa } from '../models/interfaces';
import { LoginSchema, schemaValidator, TfaSchema } from '../security/schemaValidator';

export class AuthenticationRouter {

    private authController: AuthController;
    constructor() {
        this.authController = new AuthController();
    }

    public routes(app: express.Express): void {

        app.route('/API/auth/login')
            .post(async (req: Request, res: Response) => {
                const loginData: Login = await schemaValidator(req, res, LoginSchema);

                this.authController.login(req, res, loginData)
                    .then(() => {
                        res.send();
                    })
                    .catch(() => {
                        res.status(501).send();
                    });
            });

        app.route('/API/auth/login/tfa')
            .post(async (req: Request, res: Response) => {
                const loginData: LoginTfa = await schemaValidator(req, res, TfaSchema);

                this.authController.loginTfa(req, res, loginData)
                    .then(() => {
                        res.send();
                    })
                    .catch(() => {
                        res.status(501).send();
                    });
            });

        app.route('/API/auth/logout')
            .post(async (req: Request, res: Response) => {

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
