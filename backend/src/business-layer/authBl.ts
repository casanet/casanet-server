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
    public async login(response: express.Response, login: Login): Promise<void> {

        const errorResponse: ErrorResponse = {
            responseCode: 2403,
            message: 'user name or password incorrent',
        };

        const user = await this.usersBl.getUser(login.email)
            .catch(() => {
                logger.info(`login email ${login.email} fail, invalid cert`);
                response.statusCode = 403;
                throw errorResponse;
            });

        if (cryptoJs.SHA256(login.password).toString() !== user.password) {
            response.statusCode = 403;
            throw errorResponse;
        }

        if (user.ignoreTfa) {
            await this.activeSession(response, user);
            return;
        }

        if (!Configuration.twoStepsVerification.TwoStepEnabled) {
            logger.warn(`User ${user.email} try to login but there is no support in tfa right now`);
            throw {
                responseCode: 2501,
                message: 'MFA configuration not set correctly',
            } as ErrorResponse;
        }

        const tfaKey = randomstring.generate({
            charset: 'numeric',
            length: 6,
        });

        try {
            await SendMail(user.email, tfaKey);
        } catch (error) {
            logger.error(`Mail API problem, ${error.message}`);
            throw {
                responseCode: 3501,
                message: 'Fail to send MFA mail message, inner error.',
            } as ErrorResponse;
        }

        this.tfaLogins[user.email] = {
            generatedKey: tfaKey,
            timeStamp: new Date(),
        };

        response.statusCode = 201;
    }

    /**
     * Login to system after tfa sent.
     */
    public async loginTfa(response: express.Response, login: Login): Promise<void> {

        const errorResponse: ErrorResponse = {
            responseCode: 2403,
            message: 'user name or password incorrent',
        };

        const user = await this.usersBl.getUser(login.email)
            .catch(() => {
                logger.info(`login email ${login.email} fail, invalid cert`);
                response.statusCode = 403;
                throw errorResponse;
            });

        const tfaData = this.tfaLogins[user.email];

        /**
         * If password not match or time from pass generation is more then 5 minuts.
         */
        if (tfaData.generatedKey !== login.password ||
            new Date().getTime() - tfaData.timeStamp.getTime() > momoent.duration(5, 'minutes').asMilliseconds()) {
            response.statusCode = 403;
            throw errorResponse;
        }

        delete this.tfaLogins[user.email];
        await this.activeSession(response, user);
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
