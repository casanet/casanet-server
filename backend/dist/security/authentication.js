"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authBl_1 = require("../business-layer/authBl");
const sessionsBl_1 = require("../business-layer/sessionsBl");
const usersBl_1 = require("../business-layer/usersBl");
const iftttIntegrationDal_1 = require("../data-layer/iftttIntegrationDal");
const logger_1 = require("../utilities/logger");
/**
 * System auth scopes, shown in swagger doc as 2 kinds of security definitions.
 */
exports.SystemAuthScopes = {
    adminScope: 'adminAuth',
    userScope: 'userAuth',
    iftttScope: 'iftttAuth',
};
/**
 * Cert Authentication middelwhere API.
 * the auth token should be the value of 'session' cookie.
 * @param securityName Used as auth scope beacuse of poor scopes swaggger support in apiKey auth.
 */
exports.expressAuthentication = async (request, scopes) => {
    // If the routing security sent wrong security scope.
    if (!scopes || scopes.length < 1) {
        logger_1.logger.fatal('invalid or empty security scope');
        throw {
            responseCode: 1501,
        };
    }
    if (scopes.indexOf(exports.SystemAuthScopes.iftttScope) !== -1) {
        const authedRequest = request.body;
        if (typeof authedRequest === 'object' && authedRequest.apiKey) {
            const iftttIntegrationSettings = await iftttIntegrationDal_1.IftttIntergrationDalSingleton.getIntegrationSettings();
            if (iftttIntegrationSettings.enableIntegration && authedRequest.apiKey === iftttIntegrationSettings.apiKey) {
                return;
            }
        }
        throw {
            responseCode: 1401,
        };
    }
    // If the session cookie empty, ther is nothing to check.
    if (!request.cookies.session) {
        throw {
            responseCode: 1401,
        };
    }
    try {
        const session = await sessionsBl_1.SessionsBlSingleton.getSession(request.cookies.session);
        const user = await usersBl_1.UsersBlSingleton.getUser(session.email);
        /**
         * Make sure that session not expired.
         */
        if (new Date().getTime() - session.timeStamp > authBl_1.sessionExpiresMs) {
            await sessionsBl_1.SessionsBlSingleton.deleteSession(session);
            throw {
                responseCode: 1403,
            };
        }
        /**
         * Pass only in user scope in requierd scopes and the scope is valid.
         */
        if (scopes.indexOf(user.scope) !== -1 && Object.values(exports.SystemAuthScopes).indexOf(user.scope) !== -1) {
            return user;
        }
        logger_1.logger.info(`user ${user.email} try to access ${request.method} ${request.path} above his scope ${user.scope}`);
        throw {
            responseCode: 1403,
        };
    }
    catch (error) {
        throw {
            responseCode: 1403,
        };
    }
};
//# sourceMappingURL=authentication.js.map