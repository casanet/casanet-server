"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
const logger_1 = require("../../../backend/src/utilities/logger");
const logic_1 = require("../logic");
const schemaValidator_2 = require("./schemaValidator");
exports.jwtSecret = process.env.JWT_SECRET;
if (!exports.jwtSecret) {
    logger_1.logger.fatal('You must set the jwt secret!');
    process.exit();
}
/**
 * System auth scopes, shown in swagger doc as 2 kinds of security definitions.
 */
exports.SystemAuthScopes = {
    forwardScope: 'forwardAuth',
    adminScope: 'adminAuth',
    iftttScope: 'iftttAuth',
};
exports.forwardCache = new logic_1.Cache(+process.env.FORWARD_CACHE_TTL || 60 * 60 * 2, +process.env.FORWARD_CACHE_CHECK_PERIOD || 60 * 60);
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
    /** TODO: add cache support */
    /** Handle IFTTT requests */
    if (scopes.indexOf(exports.SystemAuthScopes.iftttScope) !== -1) {
        const { apiKey, localMac } = request.body;
        await schemaValidator_1.SchemaValidator({ apiKey, localMac }, schemaValidator_2.IftttAuthRequestSchema);
        return;
    }
    /** If the session cookie empty, ther is nothing to check. */
    if (!request.cookies.session) {
        throw {
            responseCode: 1403,
        };
    }
    /** Handle admin JWT tokens */
    if (scopes.indexOf(exports.SystemAuthScopes.adminScope) !== -1) {
        const payload = jwt.verify(request.cookies.session, exports.jwtSecret);
        return payload['email'];
    }
    /** Handle forward JWT tokens */
    if (scopes.indexOf(exports.SystemAuthScopes.forwardScope) !== -1) {
        const payload = jwt.verify(request.cookies.session, exports.jwtSecret);
        return payload;
    }
    throw {
        responseCode: 1403,
    };
};
//# sourceMappingURL=authentication.js.map