import { Request, Response } from 'express';
import * as Joi from 'joi';
import { JoiObject, ObjectSchema, ValidationResult } from 'joi';
import { ErrorResponse } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { getIp } from './authentication';

export const LoginSchema: ObjectSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().not('').required(),
}).required();

export const TfaSchema: ObjectSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().not('').required(),
    tfaPassword: Joi.string().not('').required(),
}).required();

export const ErrorResponseSchema: ObjectSchema = Joi.object().keys({
    responseCode: Joi.number().min(4000).max(5999).required(),
    message: Joi.string().not(''),
}).required();

/**
 * Validate the req.body json by given scema
 * If fail, reject with code 422.
 * Else return the object after clean.
 * @param {Request} req The express req object
 * @param {JoiObject} schema The Joi schema object
 * @returns {Promise<any|ErrorResponse>} Promise when seccess with cleaned data.
 */
export const RequestSchemaValidator = async (req: Request, schema: JoiObject): Promise<any | ErrorResponse> => {
    return await SchemaValidator(req.body, schema)
        .catch((result: ValidationResult<any>) => {
            logger.warn(`wrong scema data rrrived ` +
                `from ${getIp(req)}, error: ${result.error.message}`);
            const error: ErrorResponse = {
                responseCode: 422,
                message: result.error.message,
            };

            throw error;
        });
};

export const SchemaValidator = async (data: any, scema: JoiObject): Promise<any | ErrorResponse> => {
    const result: ValidationResult<any> = Joi.validate(data, scema);
    if (!result.error) {
        return result.value;
    }

    throw result;
};
