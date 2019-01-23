import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as express from 'express';
import { ErrorResponse, Login } from '../../src/models/sharedInterfaces';
import { ErrorResponseSchema, LoginSchema, RequestSchemaValidator, SchemaValidator } from '../../src/security/schemaValidator';

describe('Schema validator tests', () => {

    describe('Test login schema', () => {
        it('it should pass succsessfully', async () => {
            const login: Login = {
                email: 'aa@bb.com',
                password: '123456',
            };
            const fakeRequest = {
                body: login,
            };
            const filterdLogin = await RequestSchemaValidator(fakeRequest as express.Request, LoginSchema)
                .catch(() => {
                    throw new Error('auth fail');
                });

            expect(filterdLogin).to.deep.equal({
                email: 'aa@bb.com',
                password: '123456',
            });
            return;
        });

        it('it should fail', async () => {
            const login: Login = {
                email: 'aa@bb.com',
                password: '123456',
            };
            delete login['email'];
            const fakeRequest = {
                body: login,
            };
            let validationFail = true;
            await RequestSchemaValidator(fakeRequest as express.Request, LoginSchema)
                .then(() => {
                    validationFail = false;
                })
                .catch((err) => {

                });

            if (!validationFail) {
                throw new Error('valiation shuold fail');
            }

            return;
        });
    });

    describe('Test error response schema', () => {
        it('it should pass succsessfully', async () => {
            const error: ErrorResponse = {
                responseCode: 5043,
            };
            const filterdError = await SchemaValidator(error, ErrorResponseSchema)
                .catch(() => {
                    throw new Error('valid error response schema fail');
                });

            expect(filterdError).to.deep.equal(error);
            return;
        });

        it('it should fail', async () => {
            const error = {
                message: '5043',
            };

            try {
                await SchemaValidator(error, ErrorResponseSchema);
            } catch (error) {
                return;
            }

            throw new Error('invalid schema passed validator');
        });
    });
});
