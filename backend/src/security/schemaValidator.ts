import { Request, Response } from 'express';
import * as Joi from 'joi';
import { JoiObject, ObjectSchema, ValidationResult } from 'joi';
import { logger } from '../utilities/logger';
import { SecurityGate } from './accessGate';

export const LoginSchema: ObjectSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().not('').required(),
}).required();

export const TfaSchema: ObjectSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().not('').required(),
    tfaPassword: Joi.string().not('').required(),
}).required();

/**
 * Validate the req.body json by given scema
 * If fail, send back 422 http error and return false.
 * Else return the object after clean.
 * @param {Request} req The express req object
 * @param {Response} res The express res object
 * @param {JoiObject} scema The Joi schema object
 * @returns {Promise<any>} Promise when seccess with cleaned data.
 */
export const schemaValidator = (req: Request, res: Response, scema: JoiObject): Promise<any> => {
    return new Promise((resolve, reject) => {
        const result: ValidationResult<any> = Joi.validate(req.body, scema);
        if (!result.error) {
            resolve(result.value);
            return;
        }

        logger.warn(`wrong scema data rrrived ` +
            `from ${SecurityGate.getIp(req)}, error: ${result.error.message}`);
        res.status(422).send(result.error.message);
    });
};
