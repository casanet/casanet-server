import { Request, Response } from 'express';
import * as express from 'express';
import { ErrorResponse, Login, User } from '../../../backend/src/models/sharedInterfaces';
import { SystemAuthScopes } from '../../../backend/src/security/authentication';
import { RequestSchemaValidator } from '../../../backend/src/security/schemaValidator';
import { ForwardAuthController as ForwardAuthController } from '../controllers/forwardAuthController';
import { ForwardUserSession } from '../models/remoteInterfaces';
import { LocalServerInfo } from '../models/sharedInterfaces';
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

                try {
                    const apiResData: ErrorResponse | LocalServerInfo[] = await this.forwardAuthController.login(req, res, loginData);
                    /** Case error is planned (and not some inner error that was thrown from somewhere) return it to client. */
                    res.send(apiResData);
                } catch (error) {
                    /** Any other unplanned error, don't send to the client any clue about it. */
                    res.status(403).send();
                }
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

                try {
                    const apiError: ErrorResponse = await this.forwardAuthController.loginTfa(req, res, loginData);
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
