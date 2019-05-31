import * as Joi from 'joi';
import { ObjectSchema } from 'joi';

export const IftttOnChangedSchema: ObjectSchema = Joi.object().keys({
    localMac: Joi.string().not('').required(),
    deviceId: Joi.string().not('').required(),
    newStatus: Joi.string().allow('on', 'off').required(),
}).required();

export const LoginLocalServerSchema: ObjectSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().not('').required(),
    localServerId: Joi.string().allow(''),
}).required();

const forwardAccountSchema: ObjectSchema = Joi.object().keys({
    email: Joi.string().email().required(),
});

const registerAccountSchema: ObjectSchema = Joi.object().keys({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).required(),
});

const initSchema = Joi.object().keys({
    macAddress: Joi.string().not('').length(12).required(),
    remoteAuthKey: Joi.string().not('').required(),
});

const httpResponseSchema = Joi.object().keys({
    requestId: Joi.string().not('').required(),
    httpStatus: Joi.number().integer().required(),
    httpBody: Joi.any(),
    httpSession: Joi.object().keys({
        key: Joi.string().not('').required(),
        maxAge: Joi.number().required(),
    }),
});

const emptyMessageSchema = Joi.object().keys({});

const feedSchema = Joi.object().keys({
    feedType: Joi.valid('minions', 'timings').required(),
    feedContent: Joi.any().required(),
});

export const LocalMessageSchema: ObjectSchema = Joi.object().keys({
    localMessagesType:
        Joi.valid('initialization',
            'sendRegistrationCode',
            'unregisterAccount',
            'registerAccount',
            'httpResponse',
            'ack',
            'feed').required(),
    message: Joi.alternatives()
        .when('localMessagesType', {
            is: 'initialization',
            then: Joi.object().keys({ initialization: initSchema.required() }).required(),
        })
        .when('localMessagesType', {
            is: 'sendRegistrationCode',
            then: Joi.object().keys({ sendRegistrationCode: forwardAccountSchema.required() }).required(),
        })
        .when('localMessagesType', {
            is: 'unregisterAccount',
            then: Joi.object().keys({ unregisterAccount: forwardAccountSchema.required() }).required(),
        })
        .when('localMessagesType', {
            is: 'registerAccount',
            then: Joi.object().keys({ registerAccount: registerAccountSchema.required() }).required(),
        })
        .when('localMessagesType', {
            is: 'httpResponse',
            then: Joi.object().keys({ httpResponse: httpResponseSchema.required() }).required(),
        })
        .when('localMessagesType', {
            is: 'ack',
            then: emptyMessageSchema.required(),
        })
        .when('localMessagesType', {
            is: 'feed',
            then: Joi.object().keys({ feed: feedSchema.required() }).required(),
        }),
}).required();
