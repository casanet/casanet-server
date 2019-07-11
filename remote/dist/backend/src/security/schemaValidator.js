"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
const logger_1 = require("../utilities/logger");
exports.RemoteSettingsSchema = Joi.object().keys({
    host: Joi.string().uri().regex(/^(ws:\/\/|wss:\/\/)/).required(),
    connectionKey: Joi.string().not('').required(),
}).required();
exports.UserSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    displayName: Joi.string().not('').required(),
    password: Joi.string().not('').min(6).max(18).required(),
    ignoreTfa: Joi.boolean().required(),
    scope: Joi.allow('adminAuth', 'userAuth').required(),
}).required();
exports.UserUpdateSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    displayName: Joi.string().not('').required(),
    password: Joi.string().allow('').min(6).max(18),
    ignoreTfa: Joi.boolean().required(),
    scope: Joi.allow('adminAuth', 'userAuth'),
}).required();
exports.LoginSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().not('').required(),
}).required();
exports.ErrorResponseSchema = Joi.object().keys({
    responseCode: Joi.number().min(4000).max(5999).required(),
    message: Joi.string().not(''),
}).required();
/**
 * Get request client IP.
 */
exports.GetIp = (req) => {
    let ip = req.headers['x-forwarded-for'];
    if (ip) {
        const ipParts = ip.split(',');
        ip = ipParts[ipParts.length - 1];
    }
    else {
        ip = req.connection.remoteAddress;
    }
    return ip;
};
/**
 * Validate the req.body json by given scema
 * If fail, reject with code 422.
 * Else return the object after clean.
 * @param {Request} req The express req object
 * @param {JoiObject} schema The Joi schema object
 * @returns {Promise<any|ErrorResponse>} Promise when seccess with cleaned data.
 */
exports.RequestSchemaValidator = async (req, schema) => {
    return await exports.SchemaValidator(req.body, schema)
        .catch((result) => {
        logger_1.logger.warn(`wrong scema data rrrived ` +
            `from ${exports.GetIp(req)}, error: ${result.error.message}`);
        const error = {
            responseCode: 2422,
            message: result.error.message,
        };
        throw error;
    });
};
/**
 * Validate json by given scema
 * If fail, reject with error message.
 * Else return the object after clean.
 * @param {Request} req The express req object
 * @param {JoiObject} schema The Joi schema object
 */
exports.SchemaValidator = async (data, scema) => {
    const result = Joi.validate(data, scema);
    if (!result.error) {
        return result.value;
    }
    throw result;
};
//# sourceMappingURL=schemaValidator.js.map