import * as bcrypt from 'bcryptjs';
import * as express from 'express';
import * as momoent from 'moment';
import * as randomstring from 'randomstring';
import { Configuration } from '../config';
import { ErrorResponse, Login, LoginMfa, User } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { SendMail } from '../utilities/mailSender';
import { SessionsBl, SessionsBlSingleton } from './sessionsBl';
import { UsersBl, UsersBlSingleton } from './usersBl';

declare interface TfaData {
	generatedKey: string;
	timeStamp: Date;
}

export interface LoginResults {
	key: string;
	success: boolean,
	error?: ErrorResponse,
	requireMfa?: boolean;
}

export const sessionExpiresMs = (+process.env.SESSION_EXPIRES_DAYS || 365) * 24 * 60 * 60 * 1000;

export class AuthBl {
	private readonly GENERIC_ERROR_RESPONSE: ErrorResponse = {
		responseCode: 2403,
		message: 'username or password is incorrect',
	};

	private sessionsBl: SessionsBl;
	private usersBl: UsersBl;

	private tfaLogins: { [key: string]: TfaData } = {};

	/**
	 * Init auth bl. using dependecy injection pattern to allow units testings.
	 * @param sessionsBl Inject the sessions bl instance to used sessionBl.
	 * @param usersBl Inject the user bl instance to used userBl.
	 */
	constructor(sessionsBl: SessionsBl, usersBl: UsersBl) {
		this.sessionsBl = sessionsBl;
		this.usersBl = usersBl;
	}

	/**
	 * Login to system.
	 */
	public async login(login: Login): Promise<LoginResults> {
		let userTryToLogin: User;

		try {
			userTryToLogin = await this.usersBl.getUser(login.email);
		} catch (error) {
			/** case user not in system return generic error. */
			logger.debug(`login email ${login.email} fail, invalid user name`);
			throw this.GENERIC_ERROR_RESPONSE;
		}

		/** If User not fault or password not match  */
		if (!(await bcrypt.compare(login.password, userTryToLogin.password))) {
			logger.debug(`login email ${login.email} fail, invalid password`);
			/** Case password incorrect return generic error. */
			throw this.GENERIC_ERROR_RESPONSE;
		}

		/** Case user not require MFA, the login process done. */
		if (userTryToLogin.ignoreTfa) {
			logger.debug(`login email ${login.email} succeed`);
			const key = await this.sessionsBl.generateSession(userTryToLogin);
			return {
				key,
				success: true,
			}
		}

		logger.debug(`login email ${login.email} generating TFA code...`);

		/** Case user require MFA but email account not properly sets, send error message about it. */
		if (!Configuration.twoStepsVerification.TwoStepEnabled) {
			logger.error(`User ${userTryToLogin.email} try to login but there is no support in tfa right now`);
			throw {
				responseCode: 2501,
				message: 'MFA configuration not set correctly',
			} as ErrorResponse;
		}

		/** Generate random MFA key. */
		const tfaKey = randomstring.generate({
			charset: 'numeric',
			length: 6,
		});

		try {
			/** Try to send MFA key to user email. */
			await SendMail(userTryToLogin.email, tfaKey);
		} catch (error) {
			/** Case sending fail leet hime know it. */
			logger.error(`Mail API problem, ${error.message}`);
			return {
				key: '',
				success: false,
				error: {
					responseCode: 3501,
					message: 'Fail to send MFA mail message, inner error.',
				} as ErrorResponse
			}
		}

		/** Map generated key to user. */
		this.tfaLogins[userTryToLogin.email] = {
			generatedKey: tfaKey,
			timeStamp: new Date(),
		};

		return {
			key : '',
			success: true,
			requireMfa: true
		}
	}

	/**
	 * Login to system after tfa sent.
	 */
	public async loginTfa(login: LoginMfa) : Promise<LoginResults> {
		let userTryToLogin: User;
		try {
			userTryToLogin = await this.usersBl.getUser(login.email);
		} catch (error) {
			/** case user not in system return generic error. */
			logger.info(`login email ${login.email} fail, invalid cert`);
			throw this.GENERIC_ERROR_RESPONSE;
		}

		/** Get MFA key if exists */
		const tfaData = this.tfaLogins[userTryToLogin.email];

		/**
		 * If user request MFA in last 5 minutes, and MFA key same as generated, let user pass.
		 */
		if (
			tfaData &&
			tfaData.generatedKey === login.mfa &&
			new Date().getTime() - tfaData.timeStamp.getTime() < momoent.duration(5, 'minutes').asMilliseconds()
		) {
			delete this.tfaLogins[userTryToLogin.email];
			const key = await this.sessionsBl.generateSession(userTryToLogin);
			return {
				key,
				success: true,
			}
		}

		/** Any other case, return generic error. */
		throw this.GENERIC_ERROR_RESPONSE;
	}

	/**
	 * Logout.
	 * @param response
	 */
	public async logout(sessionKey: string): Promise<void> {
		const session = await this.sessionsBl.getSession(sessionKey);
		await this.sessionsBl.deleteSession(session);
	}

}

export const AuthBlSingleton = new AuthBl(SessionsBlSingleton, UsersBlSingleton);
