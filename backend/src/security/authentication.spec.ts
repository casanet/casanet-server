import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as express from 'express';
import { validSession, validSystemAdmin, validSystemUser } from '../../e2e/prepareRoutesSpecTests.spec';
import { ErrorResponse, User } from '../models/sharedInterfaces';
import { expressAuthentication, SystemAuthScopes } from './authentication';

describe('Security scopes validation middelwere', () => {

    describe('Test certification', () => {
        it('it should pass succsessfully', async () => {
            const faksRequest = {
                cookies: {
                    session: validSession.userSessionKey,
                },
            };
            const user = await expressAuthentication(faksRequest as express.Request, SystemAuthScopes.userScope, [])
                .catch(() => {
                    throw new Error('auth fail');
                });

            expect(user).to.deep.equal(validSystemUser);
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

        it('it should denied', async () => {
            const faksRequest = {
                cookies: {
                },
            };
            expressAuthentication(faksRequest as express.Request, SystemAuthScopes.userScope, [])
                .then(() => {
                    throw new Error('Access should denied, but empty cert passed');
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
                    session: validSession.adminSessionKey,
                },
            };
            const user = await expressAuthentication(faksRequest as express.Request, SystemAuthScopes.adminScope, [])
                .catch(() => {
                    throw new Error('admin scope auth fail');
                });

            expect(user).to.deep.equal(validSystemAdmin);
            return;
        });

        it('it should denied any access', async () => {
            const faksRequest = {
                cookies: {
                    session: validSession.userSessionKey,
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
                    session: validSession.userSessionKey,
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
