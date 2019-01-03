import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as express from 'express';
import { ErrorResponse, Login, LoginTfa } from '../models/sharedInterfaces';
import { LoginSchema, schemaValidator, TfaSchema } from './schemaValidator';

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
            const filterdLogin = await schemaValidator(fakeRequest as express.Request, LoginSchema)
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
            await schemaValidator(fakeRequest as express.Request, LoginSchema)
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

    describe('Test login tfa schema', () => {
        it('it should pass succsessfully', async () => {
            const login: LoginTfa = {
                email: 'aa@bb.com',
                password: '123456',
                tfaPassword: '43434',
            };
            const fakeRequest = {
                body: login,
            };
            const filterdLogin = await schemaValidator(fakeRequest as express.Request, TfaSchema)
                .catch(() => {
                    throw new Error('auth fail');
                });

            expect(filterdLogin).to.deep.equal({
                email: 'aa@bb.com',
                password: '123456',
                tfaPassword: '43434',
            });
            return;
        });

        it('it should fail', async () => {
            const login: LoginTfa = {
                email: 'aa@bb.com',
                password: '123456',
                tfaPassword: '43434',
            };
            login.email = 'aabb.com';
            const fakeRequest = {
                body: login,
            };
            let validationFail = true;
            await schemaValidator(fakeRequest as express.Request, TfaSchema)
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
});
