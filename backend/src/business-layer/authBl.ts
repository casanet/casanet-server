import * as cryptoJs from 'crypto-js';
import * as express from 'express';
import * as momoent from 'moment';
import * as randomstring from 'randomstring';
import { Configuration } from '../config';
import { ErrorResponse, Login, User } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { SendMail } from '../utilities/mailSender';
import { SessionsBl, SessionsBlSingleton } from './sessionsBl';
import { UsersBl, UsersBlSingleton } from './usersBl';

declare interface TfaData {
    generatedKey: string;
    timeStamp: Date;
}

export class AuthBl {

    private readonly GENERIC_ERROR_RESPONSE: ErrorResponse = {
        responseCode: 2403,
        message: 'username or password is incorrect',
    };

    private sessionsBl: SessionsBl;
    private usersBl: UsersBl;

    private tfaLogins: { [key: string]: TfaData } = {};

    /**
     * Init auth bl. using dependecy injection pattern to allow units testings.
     * @param sessionsBl Inject the sessions bl instance to used sessionBl.
     * @param usersBl Inject the user bl instance to used userBl.
     */
    constructor(sessionsBl: SessionsBl, usersBl: UsersBl) {

        this.sessionsBl = sessionsBl;
        this.usersBl = usersBl;
    }

    private async activeSession(response: express.Response, user: User): Promise<void> {

        const sessionKey = await this.sessionsBl.generateSession(user);

        /**
         * Finally load session on cookies response.
         */
        response.cookie('session', sessionKey, {
            sameSite: true,
            httpOnly: true, // minimize risk of XSS attacks by restricting the client from reading the cookie
            secure: Configuration.http.useHttps, // only send cookie over https
            maxAge: user.sessionTimeOutMS,
        });
    }

    /**
     * Login to system.
     */
    public async login(response: express.Response, login: Login): Promise<ErrorResponse> {

        let userTryToLogin: User;
        try {
            userTryToLogin = await this.usersBl.getUser(login.email);
        } catch (error) {
            /** case user not in system return generic error. */
            logger.info(`login email ${login.email} fail, invalid cert`);
            response.statusCode = 403;
            return this.GENERIC_ERROR_RESPONSE;
        }

        if (cryptoJs.SHA256(login.password).toString() !== userTryToLogin.password) {
            /** Case password incorrect return generic error. */
            response.statusCode = 403;
            return this.GENERIC_ERROR_RESPONSE;
        }

        /** Case user not require MFA, the login prossess done. */
        if (userTryToLogin.ignoreTfa) {
            await this.activeSession(response, userTryToLogin);
            return;
        }

        /** Case user require MFA but email account not properly sets, send error message about it. */
        if (!Configuration.twoStepsVerification.TwoStepEnabled) {
            logger.warn(`User ${userTryToLogin.email} try to login but there is no support in tfa right now`);
            response.statusCode = 501;
            return {
                responseCode: 2501,
                message: 'MFA configuration not set correctly',
            } as ErrorResponse;
        }

        /** Generate random MFA key. */
        const tfaKey = randomstring.generate({
            charset: 'numeric',
            length: 6,
        });

        try {
            /** Try to send MFA key to user email. */
            await SendMail(userTryToLogin.email, tfaKey);
        } catch (error) {
            /** Case sending fail leet hime know it. */
            logger.error(`Mail API problem, ${error.message}`);
            response.statusCode = 501;
            return {
                responseCode: 3501,
                message: 'Fail to send MFA mail message, inner error.',
            } as ErrorResponse;
        }

        /** Map generated key to user. */
        this.tfaLogins[userTryToLogin.email] = {
            generatedKey: tfaKey,
            timeStamp: new Date(),
        };

        /** Mark status to 201, means, the login is OK but needs extra, MFA. */
        response.statusCode = 201;
    }

    /**
     * Login to system after tfa sent.
     */
    public async loginTfa(response: express.Response, login: Login): Promise<ErrorResponse> {

        let userTryToLogin: User;
        try {
            userTryToLogin = await this.usersBl.getUser(login.email);
        } catch (error) {
            /** case user not in system return generic error. */
            logger.info(`login email ${login.email} fail, invalid cert`);
            response.statusCode = 403;
            return this.GENERIC_ERROR_RESPONSE;
        }

        /** Get MFA key if exists */
        const tfaData = this.tfaLogins[userTryToLogin.email];

        /**
         * If user request MFA in last 5 minutes, and MFA key same as generated, let user pass.
         */
        if (tfaData &&
            tfaData.generatedKey === login.password &&
            new Date().getTime() - tfaData.timeStamp.getTime() < momoent.duration(5, 'minutes').asMilliseconds()) {
            delete this.tfaLogins[userTryToLogin.email];
            await this.activeSession(response, userTryToLogin);
            return;
        }

        /** Any other case, return generic error. */
        response.statusCode = 403;
        return this.GENERIC_ERROR_RESPONSE;
    }

    /**
     * Logout.
     * @param response
     */
    public async logout(sessionKey: string, response: express.Response): Promise<void> {
        const session = await this.sessionsBl.getSession(sessionKey);
        await this.sessionsBl.deleteSession(session);
        response.cookie('session', '');
    }
}

export const AuthBlSingleton = new AuthBl(SessionsBlSingleton, UsersBlSingleton);
