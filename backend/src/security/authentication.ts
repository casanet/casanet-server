import * as express from 'express';
import { Application, NextFunction, Request, Response } from 'express';
import { sessionExpiresMs } from '../business-layer/authBl';
import { SessionsBlSingleton } from '../business-layer/sessionsBl';
import { UsersBlSingleton } from '../business-layer/usersBl';
import { Session } from '../models/backendInterfaces';
import {
	AuthScopes,
	ErrorResponse,
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
} = {
	adminScope: 'adminAuth',
	userScope: 'userAuth',
};

export async function verifyBySecurity(request: express.Request, securityNames: string[]) {
	for (const securityName of securityNames) {
		try {
			const user = await expressAuthentication(request, securityName);
			return user;
		} catch (error) {
			// Let give a try to the next scop
		}
	}

	// If nothing helps, throw 401
	throw {
		responseCode: 1401,
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
			message: 'Internal Error',
			responseCode: 1503,
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
			message: 'No session found',
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
				message: 'Session expired',
				responseCode: 1401,
			} as ErrorResponse;
		}

		/**
		 * Pass only in user scope in required scopes and the scope is valid.
		 */
		if (user.scope.includes(securityName)) {
			return user;
		} 

		throw {
			// throw no permission (403) and not the unauthorized (401) 
			message: 'Unauthorized scope',
			responseCode: 1403,
		} as ErrorResponse;
	} catch (error) {

		if (error?.responseCode && error?.message) {
			throw error;
		}
	
		throw {
			message: 'Authorization failed',
			responseCode: 1401,
		} as ErrorResponse;
	}
};
