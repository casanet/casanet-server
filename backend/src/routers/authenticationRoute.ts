import { Request, Response } from 'express';
import * as express from 'express';
import { AuthController } from '../controllers/authController';
import { ErrorResponse, Login, User } from '../models/sharedInterfaces';
import { SystemAuthScopes } from '../security/authentication';
import { LoginSchema, RequestSchemaValidator } from '../security/schemaValidator';
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
                    loginData = await RequestSchemaValidator(req, LoginSchema);
                } catch {
                    res.status(422).send();
                    return;
                }

                try {
                    const apiError: ErrorResponse = await this.authController.login(req, res, loginData);
                    /** Case error is planned (and not some inner error that was thrown from somewhere) return it to client. */
                    res.send(apiError);
                } catch (error) {
                    /** Any other unplanned error, don't send to the client any clue about it. */
                    res.status(403).send();
                }
            });

        app.route('/API/auth/login/tfa')
            .post(async (req: Request, res: Response) => {
                let loginData: Login;
                try {
                    loginData = await RequestSchemaValidator(req, LoginSchema);
                } catch {
                    res.status(422).send();
                    return;
                }

                try {
                    const apiError: ErrorResponse = await this.authController.loginTfa(req, res, loginData);
                    /** Case error is planned (and not some inner error that was thrown from somewhere) return it to client. */
                    res.send(apiError);
                } catch (error) {
                    /** Any other unplanned error, don't send to the client any clue about it. */
                    res.status(403).send();
                }
            });

        app.route('/API/auth/logout')
            .post(async (req: Request, res: Response) => {

                /**
                 * Because there is not use in TSOA security, needs to call middelwhere manualy.
                 */
                req.user = await expressAuthentication(req, [SystemAuthScopes.userScope,
                SystemAuthScopes.adminScope])
                    .catch((error: ErrorResponse) => {
                        res.status(403).send(error);
                    }) as User;

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
