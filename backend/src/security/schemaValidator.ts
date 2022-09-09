import { Request, Response } from 'express';
import * as Joi from 'joi';
import { JoiObject, ObjectSchema, ValidationResult } from 'joi';
import { ErrorResponse } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

export const RemoteSettingsSchema: ObjectSchema = Joi.object()
	.keys({
		host: Joi.string()
			.uri()
			.regex(/^(ws:\/\/|wss:\/\/)/)
			.required(),
		connectionKey: Joi.string()
			.not('')
			.required(),
		blockLogsFetchByRemote: Joi.boolean(),
	})
	.required();

export const UserSchema: ObjectSchema = Joi.object()
	.keys({
		email: Joi.string()
			.email()
			.required(),
		displayName: Joi.string()
			.not('')
			.required(),
		password: Joi.string()
			.not('')
			.min(8)
			.required(),
		ignoreTfa: Joi.boolean().required(),
		scope: Joi.allow('adminAuth', 'userAuth').required(),
	})
	.required();

export const UserUpdateSchema: ObjectSchema = Joi.object()
	.keys({
		email: Joi.string()
			.email()
			.required(),
		displayName: Joi.string()
			.not('')
			.required(),
		password: Joi.string()
			.allow('')
			.min(8),
		ignoreTfa: Joi.boolean().required(),
		// Allow it, but make sure to ignore it in the BL
		passwordChangeRequired: Joi.boolean(),
		scope: Joi.allow('adminAuth', 'userAuth'),
	})
	.required();

export const LoginSchema: ObjectSchema = Joi.object()
	.keys({
		email: Joi.string()
			.email()
			.required(),
		password: Joi.string()
			.not('')
			.required(),
		localServerId: Joi.string().allow(''),
	})
	.required();

export const LoginMfaSchema: ObjectSchema = Joi.object()
	.keys({
		email: Joi.string()
			.email()
			.required(),
		mfa: Joi.string()
			.min(6)
			.max(6)
			.required(),
		localServerId: Joi.string().allow(''),
	})
	.required();

export const ErrorResponseSchema: ObjectSchema = Joi.object()
	.keys({
		responseCode: Joi.number()
			.min(4000)
			.max(5999)
			.required(),
		message: Joi.string().not(''),
	})
	.required();

/**
 * Get request client IP.
 */
export const GetIp = (req: Request): string => {
	let ip = req.headers['x-forwarded-for'] as string;
	if (ip) {
		const ipParts = ip.split(',');
		ip = ipParts[ipParts.length - 1];
	} else {
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
export const RequestSchemaValidator = async (req: Request, schema: JoiObject): Promise<any | ErrorResponse> => {
	return await SchemaValidator(req.body, schema).catch((result: ValidationResult<any>) => {
		logger.warn(`wrong scema data rrrived ` + `from ${GetIp(req)}, error: ${result.error.message}`);
		const error: ErrorResponse = {
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
export const SchemaValidator = async (data: any, scema: JoiObject): Promise<any | ValidationResult<any>> => {
	const result: ValidationResult<any> = Joi.validate(data, scema);
	if (!result.error) {
		return result.value;
	}

	throw result;
};
