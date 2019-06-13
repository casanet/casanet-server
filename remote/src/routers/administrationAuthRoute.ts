import { Request, Response } from 'express';
import * as express from 'express';
import { AuthBlSingleton } from '../../../backend/src/business-layer/authBl';
import { ErrorResponse, Login, User } from '../../../backend/src/models/sharedInterfaces';
import { SystemAuthScopes } from '../../../backend/src/security/authentication';
import { expressAuthentication } from '../../../backend/src/security/authentication';
import { LoginSchema, RequestSchemaValidator } from '../../../backend/src/security/schemaValidator';

/** Route login/logout to remote server administation. */
export class AdministrationAuthRouter {

    public routes(app: express.Express): void {

        app.route('/API/administration/auth/login')
            .post(async (req: Request, res: Response) => {
                let loginData: Login;
                try {
                    loginData = await RequestSchemaValidator(req, LoginSchema);
                } catch {
                    res.status(422).send();
                    return;
                }

                try {
                    const apiError: ErrorResponse = await AuthBlSingleton.login(res, loginData);
                    /** Case error is planned (and not some inner error that was thrown from somewhere) return it to client. */
                    res.send(apiError);
                } catch (error) {
                    /** Any other unplanned error, don't send to the client any clue about it. */
                    res.status(403).send();
                }
            });

        app.route('/API/administration/auth/login/tfa')
            .post(async (req: Request, res: Response) => {
                let loginData: Login;
                try {
                    loginData = await RequestSchemaValidator(req, LoginSchema);
                } catch {
                    res.status(422).send();
                    return;
                }

                try {
                    const apiError: ErrorResponse = await AuthBlSingleton.loginTfa(res, loginData);
                    /** Case error is planned (and not some inner error that was thrown from somewhere) return it to client. */
                    res.send(apiError);
                } catch (error) {
                    /** Any other unplanned error, don't send to the client any clue about it. */
                    res.status(403).send();
                }
            });

        app.route('/API/administration/auth/logout')
            .post(async (req: Request, res: Response) => {

                /**
                 * Because there is not use in TSOA security, needs to call middelwhere manualy.
                 */
                req.user = await expressAuthentication(req, [SystemAuthScopes.adminScope])
                    .catch((error: ErrorResponse) => {
                        res.status(403).send(error);
                    }) as User;

                // If auth fail abort the request
                if (!req.user) {
                    res.status(403).send();
                    return;
                }

                AuthBlSingleton.logout(req.cookies.session, res)
                    .then(() => {
                        res.send();
                    })
                    .catch(() => {
                        res.status(501).send();
                    });
            });
    }
}
