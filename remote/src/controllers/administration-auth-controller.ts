import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse, Login } from '../../../backend/src/models/sharedInterfaces';
import { SchemaValidator, LoginSchema } from '../../../backend/src/security/schemaValidator';
import { getUsers, checkUserAccess } from '../data-access';
import { RemoteAdmin } from '../models';
import { Configuration } from '../../../backend/src/config';
import { logger } from '../../../backend/src/utilities/logger';
import * as randomstring from 'randomstring';
import { SendMail } from '../../../backend/src/utilities/mailSender';
import * as jwt from 'jsonwebtoken';
import * as momoent from 'moment';

export const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2 days';
if (!jwtSecret) {
    console.error('You must set the jwt secret!');
    process.exit();
}

declare interface TfaData {
    generatedKey: string;
    timeStamp: Date;
}

const tfaLogins: { [key: string]: TfaData } = {};


/**
 * Because that express response object needs in auth logic (to write cookies)
 * The TSOA routing is for documentation only.
 * and one day i will extends TSOA lib to support response in parameter inject like request object.
 */
@Tags('Administration')
@Route('/administration/auth')
export class AdministrationAuthController extends Controller {

    private async activeSession(user: RemoteAdmin): Promise<void> {

        const token = jwt.sign(
            { email: user.email },
            jwtSecret,
            { expiresIn: jwtExpiresIn }
        );
        /**
         * Finally load session on cookies response.
         */
        this.setHeader('Set-Cookie', `session=${token}; Max-Age=${2 * 24 * 60 * 60 * 1000}; Path=/; HttpOnly; ${Configuration.http.useHttps ? 'Secure' : ''} SameSite=Strict`);
    }

    /**
     * Login to the administration system.
     */
    @Response<void>(201, '2-fatore code sent')
    @Response<ErrorResponse>(501, 'Server error')
    @Response<ErrorResponse>(403, 'Auth fail')
    @Response<ErrorResponse>(422, 'Invalid schema')
    @Post('login')
    public async administrationLogin(@Request() request: express.Request, @Body() login: Login): Promise<void> {
        try {
            login = await SchemaValidator(login, LoginSchema);
        } catch (err) {
            this.setStatus(422);
            return err.error.message;
        }

        const user = await checkUserAccess(login);

        if (!user) {
            this.setStatus(401);
            return;
        }

        /** Case user not require MFA, the login prossess done. */
        if (user.ignoreTfa) {
            return await this.activeSession(user);
        }

        /** Case user require MFA but email account not properly sets, send error message about it. */
        if (!Configuration.twoStepsVerification.TwoStepEnabled) {
            logger.warn(`User try to login but there is no support in tfa right now`);
            this.setStatus(501);
            return;
        }

        /** Generate random MFA key. */
        const tfaKey = randomstring.generate({
            charset: 'numeric',
            length: 6,
        });

        try {
            /** Try to send MFA key to user email. */
            await SendMail(user.email, tfaKey);
        } catch (error) {
            /** Case sending fail leet hime know it. */
            logger.error(`Mail API problem, ${error.message}`);
            this.setStatus(501);
            return;
        }

        /** Map generated key to user. */
        tfaLogins[user.email] = {
            generatedKey: tfaKey,
            timeStamp: new Date(),
        };

        /** Mark status to 201, means, the login is OK but needs extra, MFA. */
        this.setStatus(201);
    }

    /**
     * 2-step verification login to the administration system.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Response<ErrorResponse>(403, 'Auth fail')
    @Response<ErrorResponse>(422, 'Invalid schema')
    @Post('login/tfa')
    public async administrationLoginTfa(@Request() request: express.Request, @Body() login: Login): Promise<void> {
        try {
            login = await SchemaValidator(login, LoginSchema);
        } catch (err) {
            this.setStatus(422);
            return err.error.message;
        }

        /** Get MFA key if exists */
        const tfaData = tfaLogins[login.email];

        /**
         * If user request MFA in last 5 minutes, and MFA key same as generated, let user pass.
         */
        if (tfaData &&
            tfaData.generatedKey === login.password &&
            new Date().getTime() - tfaData.timeStamp.getTime() < momoent.duration(5, 'minutes').asMilliseconds()) {
            delete tfaLogins[login.email];
            const user = await checkUserAccess(login);

            if (!user) {
                this.setStatus(401);
            } else {
                await this.activeSession(user);
            }
            return;
        }

        /** Any other case, return generic error. */
        this.setStatus(401);
        return;
    }

    /**
     * Logout manually from the administration system.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('logout')
    public async administrationLogout(): Promise<void> {
        /** Currently there is not blacklist of invalid tokens */

        /** Send clean session by response to client browser. */
        this.setHeader('SetCookie', `session=0;`);
    }
}
