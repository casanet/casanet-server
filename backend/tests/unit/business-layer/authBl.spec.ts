import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as express from 'express';
import * as bcrypt from 'bcryptjs';
import { AuthBl, sessionExpiresMs } from '../../../src/business-layer/authBl';
import { SessionsBl } from '../../../src/business-layer/sessionsBl';
import { UsersBl } from '../../../src/business-layer/usersBl';
import { Configuration } from '../../../src/config';
import { SessionsDal } from '../../../src/data-layer/sessionsDal';
import { UsersDal } from '../../../src/data-layer/usersDal';
import { ErrorResponse, User } from '../../../src/models/sharedInterfaces';
import { SessionsDalMock } from '../data-layer/sessionsDal.mock.spec';
import { UsersDalMock } from '../data-layer/usersDal.mock.spec';

const usersDalMock = new UsersDalMock();
const sessionsDalMock = new SessionsDalMock();
const authBlMock = new AuthBl(
	new SessionsBl((sessionsDalMock as unknown) as SessionsDal),
	new UsersBl((usersDalMock as unknown) as UsersDal),
);

const GENERIC_ERROR_RESPONSE: ErrorResponse = {
	responseCode: 2403,
	message: 'username or password is incorrect',
};

describe('Authentication BL tests', () => {
	describe('Login to system', () => {
		it('it should login successfully', async () => {
			const pass = usersDalMock.mockUsers[0].password;
			const passHash = bcrypt.hashSync(pass, Configuration.keysHandling.bcryptSaltRounds)
			usersDalMock.mockUsers[0].password = passHash;
			await authBlMock.login({
				email: usersDalMock.mockUsers[0].email,
				password: pass,
			});
		});

		it('it should denied login', async () => {
			let throwError: any;
			try {
				await authBlMock.login({
					email: usersDalMock.mockUsers[0].email + 'ttt',
					password: usersDalMock.mockUsers[0].password,
				});
			} catch (error) {
				throwError = error;
			}

			expect(throwError).to.deep.equal(GENERIC_ERROR_RESPONSE);
		});

		it('it should denied login', async () => {
			let throwError: any;
			try {
				await authBlMock.login({
					email: usersDalMock.mockUsers[0].email,
					password: usersDalMock.mockUsers[0].password + 'xxx',
				});
			} catch (error) {
				throwError = error;
			}

			expect(throwError).to.deep.equal(GENERIC_ERROR_RESPONSE);
		});

		it('it should denied login tfa', async () => {
			let throwError: any;
			try {
				await authBlMock.loginTfa({
					email: usersDalMock.mockUsers[0].email,
					mfa: usersDalMock.mockUsers[0].password,
				});
			} catch (error) {
				throwError = error;
			}

			expect(throwError).to.deep.equal(GENERIC_ERROR_RESPONSE);
		});
	});
});
