"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authentication_1 = require("../../../backend/src/security/authentication");
const logger_1 = require("../../../backend/src/utilities/logger");
const forwardUserSessionsBl_1 = require("../business-layer/forwardUserSessionsBl");
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
    /** If the session cookie empty, ther is nothing to check. */
    if (!request.cookies.session) {
        throw {
            responseCode: 1403,
        };
    }
    try {
        /**
         * If scope it`s not for users, it mean that request should be from managment admin user, so use regular authentication middlewhere
         */
        if (scopes.indexOf(authentication_1.SystemAuthScopes.userScope) === -1) {
            return await authentication_1.expressAuthentication(request, scopes);
        }
        /** Else, if it`s a user scope, it mean that request should be from local server user, so check if forward session exist */
        return await forwardUserSessionsBl_1.ForwardUsersSessionsBlSingleton.getSession(request.cookies.session);
    }
    catch (error) {
        throw {
            responseCode: 1403,
        };
    }
};
//# sourceMappingURL=authenticationExtend.js.map