import * as express from 'express';
import {
	Body,
	Controller,
	Delete,
	Get,
	Header,
	Path,
	Post,
	Put,
	Request,
	Response,
	Route,
	Security,
	SuccessResponse,
	Tags,
} from 'tsoa';
import { AuthBlSingleton, sessionExpiresMs } from '../business-layer/authBl';
import { SessionsBlSingleton } from '../business-layer/sessionsBl';
import { UsersBlSingleton } from '../business-layer/usersBl';
import { Configuration, serverFqdn } from '../config';
import { ErrorResponse, Login, LoginMfa, LoginResponse, User } from '../models/sharedInterfaces';
import { AUTHENTICATION_HEADER, SESSION_COOKIE_NAME } from '../security/authentication';
import { LoginMfaSchema, LoginSchema, RequestSchemaValidator, SchemaValidator } from '../security/schemaValidator';


@Tags('Authentication')
@Route('auth')
export class AuthController extends Controller {

	private activeSession(key: string) {

		this.setHeader(AUTHENTICATION_HEADER, key);
		this.setHeader('Access-Control-Allow-Headers', 'Authorization');
		this.setHeader('Access-Control-Expose-Headers', 'Authentication');

		const maxAgeInSec = sessionExpiresMs / 1000;
		this.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=${key}; Max-Age=${maxAgeInSec}; Path=/; HttpOnly; ${Configuration.http.useHttps ? 'Secure' : ''}; SameSite=Strict;`);
	}

	/**
	 * Login.
	 */
	@Response<void>(201, '2-factors code sent')
	@Response<ErrorResponse>(501, 'Server error')
	@Response<ErrorResponse>(403, 'Auth fail')
	@Response<ErrorResponse>(422, 'Invalid schema')
	@Post('login')
	public async login(@Request() request: express.Request, @Body() login: Login): Promise<void> {
		let loginData: Login;
		try {
			loginData = await SchemaValidator(login, LoginSchema);
		} catch {
			this.setStatus(422);
			return;
		}

		try {
			const loginResults = await AuthBlSingleton.login(loginData);

			if (loginResults.key && loginResults.success && !loginResults.requireMfa) {
				this.activeSession(loginResults.key);
				this.setStatus(200);
				return {
					isRemote: false,
					localAddress: serverFqdn()
				} as LoginResponse as unknown as void;;
			}

			if (loginResults.success && loginResults.requireMfa) {
				/** Mark status to 201, means, the login is OK but needs extra, MFA. */
				this.setStatus(201);
				return {} as LoginResponse as unknown as void;;
			}

			if (loginResults.error) {
				this.setStatus(403);
				return loginResults?.error?.responseCode && { responseCode: loginResults.error.responseCode} as unknown as void;
			}

		} catch (error) {
			this.setStatus(403);
			return error?.responseCode && { responseCode: error.responseCode } as unknown as void;
		}
		this.setStatus(501);
		return {} as LoginResponse as unknown as void;;
	}

	/**
	 * 2-step verification login.
	 */
	@Response<ErrorResponse>(501, 'Server error')
	@Response<ErrorResponse>(403, 'Auth fail')
	@Response<ErrorResponse>(422, 'Invalid schema')
	@Post('login/tfa')
	public async loginTfa(@Request() request: express.Request, @Body() login: LoginMfa): Promise<void> {
		let loginData: LoginMfa;
		try {
			loginData = await SchemaValidator(login, LoginMfaSchema);
		} catch {
			this.setStatus(422);
			return {} as LoginResponse as unknown as void;
		}

		try {
			const loginResults = await AuthBlSingleton.loginTfa(loginData);

			if (loginResults.success) {
				this.activeSession(loginResults.key);
				this.setStatus(200);
				return {
					isRemote: false,
					localAddress: serverFqdn()
				} as LoginResponse as unknown as void;;
			}

			if (loginResults.error) {
				this.setStatus(403);
				return loginResults?.error?.responseCode && { responseCode: loginResults.error.responseCode } as unknown as void;
			}

		} catch (error) {
			this.setStatus(403);
			return (error?.responseCode && { responseCode: error.responseCode }) as unknown as void;
		}
		this.setStatus(501);
		return {} as LoginResponse as unknown as void;
	}


	/**
	 * Logout manually from the system.
	 */
	@Security('userAuth')
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Post('logout')
	public async logout(@Request() request: express.Request): Promise<void> {
		await AuthBlSingleton.logout(request.cookies.session);
		this.activeSession('');
	}

	/**
 * Logout from all activate sessions.
 */
	@Security('adminAuth')
	@Security('userAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Post('/logout-sessions/{userId}')
	public async logoutSessions(userId: string, @Request() request: express.Request): Promise<void> {
		const userSession = request.user as User;
		/**
		 * Only admin can update other user.
		 */
		if (userSession.scope !== 'adminAuth' && userSession.email !== userId) {
			throw {
				responseCode: 4403,
				message: 'user not allowed to logout for other users',
			} as ErrorResponse;
		}

		const user = await UsersBlSingleton.getUser(userId);
		await SessionsBlSingleton.deleteUserSessions(user);
	}
}
