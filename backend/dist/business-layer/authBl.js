"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cryptoJs = require("crypto-js");
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
        const errorResponse = {
            responseCode: 2403,
            message: 'user name or password incorrent',
        };
        const user = await this.usersBl.getUser(login.email)
            .catch(() => {
            logger_1.logger.info(`login email ${login.email} fail, invalid cert`);
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
        if (!config_1.Configuration.twoStepsVerification.TwoStepEnabled) {
            logger_1.logger.warn(`User ${user.email} try to login but there is no support in tfa right now`);
            throw {
                responseCode: 2501,
                message: 'MFA configuration not set correctly',
            };
        }
        const tfaKey = randomstring.generate({
            charset: 'numeric',
            length: 6,
        });
        try {
            await mailSender_1.SendMail(user.email, tfaKey);
        }
        catch (error) {
            logger_1.logger.error(`Mail API problem, ${error.message}`);
            throw {
                responseCode: 3501,
                message: 'Fail to send MFA mail message, inner error.',
            };
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
    async loginTfa(response, login) {
        const errorResponse = {
            responseCode: 2403,
            message: 'user name or password incorrent',
        };
        const user = await this.usersBl.getUser(login.email)
            .catch(() => {
            logger_1.logger.info(`login email ${login.email} fail, invalid cert`);
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
    async logout(sessionKey, response) {
        const session = await this.sessionsBl.getSession(sessionKey);
        await this.sessionsBl.deleteSession(session);
        response.cookie('session', '');
    }
}
exports.AuthBl = AuthBl;
exports.AuthBlSingleton = new AuthBl(sessionsBl_1.SessionsBlSingleton, usersBl_1.UsersBlSingleton);
//# sourceMappingURL=authBl.js.map