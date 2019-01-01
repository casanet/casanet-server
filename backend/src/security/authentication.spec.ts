import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as express from 'express';
import { ErrorResponse, User } from '../models/interfaces';
import { expressAuthentication, SystemAuthScopes } from './authentication';

describe('Security scopes validation middelwere', () => {

    describe('Test certification', () => {
        it('it should pass succsessfully', async () => {
            const faksRequest = {
                cookies: {
                    session: 'abc123456',
                },
            };
            const user = await expressAuthentication(faksRequest as express.Request, SystemAuthScopes.userScope, [])
                .catch(() => {
                    throw new Error('auth fail');
                });

            expect(user).to.deep.equal({
                firstName: 'ln',
                ignoreTfa: false,
                lastName: 'ln',
                password: '4544',
                sessionTimeOutMS: 54652,
            });
            return;
        });

        it('it should denied', async () => {
            const faksRequest = {
                cookies: {
                    session: 'abc1234567',
                },
            };
            expressAuthentication(faksRequest as express.Request, SystemAuthScopes.userScope, [])
                .then(() => {
                    throw new Error('Access should denied, but bad cert passed');
                })
                .catch((err: ErrorResponse | Error) => {
                    expect(err).to.deep.include({ code: 403 });
                });
        });
    });

    describe('Test Auth Scopes', () => {
        it('it should pass as admin scope', async () => {
            const faksRequest = {
                cookies: {
                    session: 'abc123456',
                },
            };
            const user = await expressAuthentication(faksRequest as express.Request, SystemAuthScopes.adminScope, [])
                .catch(() => {
                    throw new Error('admin scope auth fail');
                });

            expect(user).to.deep.equal({
                firstName: 'ln',
                ignoreTfa: false,
                lastName: 'ln',
                password: '4544',
                sessionTimeOutMS: 54652,
            });
            return;
        });

        it('it should pass as user scope', async () => {
            const faksRequest = {
                cookies: {
                    session: 'abc123456',
                },
            };
            const user = await expressAuthentication(faksRequest as express.Request, SystemAuthScopes.userScope, [])
                .catch(() => {
                    throw new Error('user scope auth fail');
                });

            expect(user).to.deep.equal({
                firstName: 'ln',
                ignoreTfa: false,
                lastName: 'ln',
                password: '4544',
                sessionTimeOutMS: 54652,
            });
            return;
        });

        it('it should denied any access', async () => {
            const faksRequest = {
                cookies: {
                    session: 'abc123456',
                },
            };
            try {
                expressAuthentication(faksRequest as express.Request, 'testScop', [])
                    .then(() => {

                    })
                    .catch(() => {

                    });

            } catch (err) {
                return;
            }
            throw new Error('Access should throw unknow scope exception, but bad scope passed');
        });

        it('it should denied any access', async () => {
            const faksRequest = {
                cookies: {
                    session: 'abc123456',
                },
            };
            try {
                expressAuthentication(faksRequest as express.Request, '', [])
                    .then(() => {

                    })
                    .catch(() => {

                    });

            } catch (err) {
                return;
            }
            throw new Error('Access should throw unknow scope exception, but empty scope passed');
        });
    });
});
