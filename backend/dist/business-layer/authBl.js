"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const momoent = require("moment");
const randomstring = require("randomstring");
const config_1 = require("../config");
const logger_1 = require("../utilities/logger");
const mailSender_1 = require("../utilities/mailSender");
const sessionsBl_1 = require("./sessionsBl");
const usersBl_1 = require("./usersBl");
class AuthBl {
    /**
     * Init auth bl. using dependecy injection pattern to allow units testings.
     * @param sessionsBl Inject the sessions bl instance to used sessionBl.
     * @param usersBl Inject the user bl instance to used userBl.
     */
    constructor(sessionsBl, usersBl) {
        this.GENERIC_ERROR_RESPONSE = {
            responseCode: 2403,
            message: 'username or password is incorrect',
        };
        this.tfaLogins = {};
        this.sessionsBl = sessionsBl;
        this.usersBl = usersBl;
    }
    async activeSession(response, user) {
        const sessionKey = await this.sessionsBl.generateSession(user);
        /**
         * Finally load session on cookies response.
         */
        response.cookie('session', sessionKey, {
            sameSite: true,
            httpOnly: true,
            secure: config_1.Configuration.http.useHttps,
            maxAge: user.sessionTimeOutMS,
        });
    }
    /**
     * Login to system.
     */
    async login(response, login) {
        let userTryToLogin;
        try {
            userTryToLogin = await this.usersBl.getUser(login.email);
        }
        catch (error) {
            /** case user not in system return generic error. */
            logger_1.logger.debug(`login email ${login.email} fail, invalid cert`);
            response.statusCode = 403;
            return this.GENERIC_ERROR_RESPONSE;
        }
        /** If User not fauld or password not match  */
        if (!await bcrypt.compare(login.password, userTryToLogin.password)) {
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
        if (!config_1.Configuration.twoStepsVerification.TwoStepEnabled) {
            logger_1.logger.warn(`User ${userTryToLogin.email} try to login but there is no support in tfa right now`);
            response.statusCode = 501;
            return {
                responseCode: 2501,
                message: 'MFA configuration not set correctly',
            };
        }
        /** Generate random MFA key. */
        const tfaKey = randomstring.generate({
            charset: 'numeric',
            length: 6,
        });
        try {
            /** Try to send MFA key to user email. */
            await mailSender_1.SendMail(userTryToLogin.email, tfaKey);
        }
        catch (error) {
            /** Case sending fail leet hime know it. */
            logger_1.logger.error(`Mail API problem, ${error.message}`);
            response.statusCode = 501;
            return {
                responseCode: 3501,
                message: 'Fail to send MFA mail message, inner error.',
            };
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
    async loginTfa(response, login) {
        let userTryToLogin;
        try {
            userTryToLogin = await this.usersBl.getUser(login.email);
        }
        catch (error) {
            /** case user not in system return generic error. */
            logger_1.logger.info(`login email ${login.email} fail, invalid cert`);
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
    async logout(sessionKey, response) {
        const session = await this.sessionsBl.getSession(sessionKey);
        await this.sessionsBl.deleteSession(session);
        response.cookie('session', '');
    }
}
exports.AuthBl = AuthBl;
exports.AuthBlSingleton = new AuthBl(sessionsBl_1.SessionsBlSingleton, usersBl_1.UsersBlSingleton);
//# sourceMappingURL=authBl.js.map