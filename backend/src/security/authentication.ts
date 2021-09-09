import * as express from 'express';
import { Application, NextFunction, Request, Response } from 'express';
import { sessionExpiresMs } from '../business-layer/authBl';
import { SessionsBlSingleton } from '../business-layer/sessionsBl';
import { UsersBlSingleton } from '../business-layer/usersBl';
import { IftttIntergrationDalSingleton } from '../data-layer/iftttIntegrationDal';
import { Session } from '../models/backendInterfaces';
import {
	AuthScopes,
	ErrorResponse,
	IftttActionTriggeredRequest,
	IftttIntegrationSettings,
	User,
} from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

export const AUTHENTICATION_HEADER = 'authentication';
export const SESSION_COOKIE_NAME = 'session';

/**
 * System auth scopes, shown in swagger doc as 2 kinds of security definitions.
 */
export const SystemAuthScopes: {
	adminScope: AuthScopes;
	userScope: AuthScopes;
	iftttScope: AuthScopes;
} = {
	adminScope: 'adminAuth',
	userScope: 'userAuth',
	iftttScope: 'iftttAuth',
};

export async function verifyBySecurity(request: express.Request, securityNames: string[]) {
	for (const securityName of securityNames) {
		try {
			const user = await expressAuthentication(request, securityName);
			return user;
		} catch (error) {
		}
	}

	throw {
		responseCode: 1403,
	} as ErrorResponse;
}

/**
 * Cert Authentication middleware API.
 */
export const expressAuthentication = async (
	request: express.Request,
	securityName: string,
	scope?: string[],
): Promise<User | ErrorResponse> => {
	// If the routing security sent wrong security scope.
	if (!securityName) {
		logger.error('invalid or empty security scope');
		throw {
			responseCode: 1501,
		} as ErrorResponse;
	}

	if (securityName == SystemAuthScopes.iftttScope) {
		const authedRequest: IftttActionTriggeredRequest = request.body;
		if (typeof authedRequest === 'object' && authedRequest.apiKey) {
			const iftttIntegrationSettings: IftttIntegrationSettings = await IftttIntergrationDalSingleton.getIntegrationSettings();
			if (iftttIntegrationSettings.enableIntegration && authedRequest.apiKey === iftttIntegrationSettings.apiKey) {
				return;
			}
		}

		throw {
			responseCode: 1401,
		} as ErrorResponse;
	}

	// The authentication header sent, use it as the token.
	// Note, that as default in production the token saved only in a secure cookie to avoid XSS.
	// But we still support using API with authentication header
	if (request.headers[AUTHENTICATION_HEADER]) {
		request.cookies[SESSION_COOKIE_NAME] = request.headers[AUTHENTICATION_HEADER] as string;
	}

	// If the session cookie empty, there is nothing to check.
	if (!request.cookies[SESSION_COOKIE_NAME]) {
		throw {
			responseCode: 1401,
		} as ErrorResponse;
	}

	try {
		const session = await SessionsBlSingleton.getSession(request.cookies.session);
		const user = await UsersBlSingleton.getUser(session.email);

		/**
		 * Make sure that session not expired.
		 */
		if (new Date().getTime() - session.timeStamp > sessionExpiresMs) {
			await SessionsBlSingleton.deleteSession(session);
			throw {
				responseCode: 1403,
			} as ErrorResponse;
		}

		/**
		 * Pass only in user scope in required scopes and the scope is valid.
		 */
		if (user.scope.includes(securityName)) {
			return user;
		}

		logger.info(`user ${user.email} try to access ${request.method} ${request.path} above his scope ${user.scope}`);
		throw {
			responseCode: 1403,
		} as ErrorResponse;
	} catch (error) {
		throw {
			responseCode: 1403,
		} as ErrorResponse;
	}
};
