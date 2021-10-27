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
import { RemoteConnectionBlSingleton } from '../business-layer/remoteConnectionBl';
import { UsersBlSingleton } from '../business-layer/usersBl';
import { ErrorResponse, User } from '../models/sharedInterfaces';
import { DeepCopy } from '../utilities/deepCopy';

declare interface UserForwardAuth {
	/**
	 * Generated code that sent to user email account
	 * @minLength 6
	 * @maxLength 6
	 */
	code: string;
}

@Tags('Users')
@Route('users')
export class UsersController extends Controller {
	/**
	 * Get user profile.
	 * @returns User.
	 */
	@Security('adminAuth')
	@Security('userAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Get('profile')
	public async getProfile(@Request() request: express.Request): Promise<User> {
		const userSession: User = request.user;
		return this.cleanUpUserBeforeRelease(await UsersBlSingleton.getUser(userSession.email));
	}

	/**
	 * Request registration code.
	 * @param userId User id/email to send code to.
	 */
	@Security('adminAuth')
	@Security('userAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Post('forward-auth/{userId}')
	public async requestUserForwarding(@Request() request: express.Request, userId: string): Promise<void> {
		this.isUserAllowed(request.user, userId);
		await RemoteConnectionBlSingleton.requestSendUserRegisterCode(userId);
	}

	/**
	 * Get registered users for forwarding from remote to local.
	 */
	@Security('adminAuth')
	@Security('userAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Get('forward')
	public async getRegisteredUsers(@Request() request: express.Request): Promise<string[]> {
		const registeredUsers = await RemoteConnectionBlSingleton.getRegisteredUsersForRemoteForwarding();
		if (request.user.scope === 'adminAuth') {
			return registeredUsers;
		}
		// For non admins, return only the self user info
		return registeredUsers.filter(u => u === request.user.email);
	}

	/**
	 *  Register account to allow forward HTTP requests from remote to local server.
	 * @param userId User id/email to register.
	 */
	@Security('adminAuth')
	@Security('userAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Post('forward/{userId}')
	public async requestUserForwardingAuth(@Request() request: express.Request, userId: string, @Body() auth: UserForwardAuth): Promise<void> {
		this.isUserAllowed(request.user, userId);
		await RemoteConnectionBlSingleton.registerUserForRemoteForwarding(userId, auth.code);
	}

	/**
	 * Remove account from local server valid account to forward from remote to local
	 * @param userId User id/email to unregister.
	 */
	@Security('adminAuth')
	@Security('userAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Delete('forward/{userId}')
	public async removeUserForwarding(@Request() request: express.Request, userId: string): Promise<void> {
		this.isUserAllowed(request.user, userId);
		await RemoteConnectionBlSingleton.unregisterUserFromRemoteForwarding(userId);
	}

	/**
	 * Get all users in the system.
	 * @returns Users array.
	 */
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Get()
	public async getUsers(): Promise<User[]> {
		return this.cleanUpUsersBeforRelease(await UsersBlSingleton.getUsers());
	}

	/**
	 * Get user by id.
	 * @returns User.
	 */
	@Security('adminAuth')
	@Security('userAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Get('{userId}')
	public async getUser(userId: string, @Request() request: express.Request): Promise<User> {
		this.isUserAllowed(request.user, userId);
		return this.cleanUpUserBeforeRelease(await UsersBlSingleton.getUser(userId));
	}

	/**
	 * Update user properties.
	 * @param userId User id.
	 * @param user User object to update to.
	 */
	@Security('adminAuth')
	@Security('userAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Put('{userId}')
	public async setUser(userId: string, @Request() request: express.Request, @Body() user: User): Promise<void> {
		const userSession = request.user as User;
		this.isUserAllowed(userSession, userId);
		user.email = userId;

		/**
		 * Never allow user to change own scope.
		 */
		if (userSession.scope !== 'adminAuth') {
			user.scope = userSession.scope;
		}

		return await UsersBlSingleton.updateUser(user);
	}

	/**
	 * Delete user from the system.
	 * @param userId User id.
	 */
	@Security('adminAuth')
	@Security('userAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Delete('{userId}')
	public async deleteUser(userId: string, @Request() request: express.Request): Promise<void> {
		this.isUserAllowed(request.user, userId);
		return await UsersBlSingleton.deleteUser(userId);
	}

	/**
	 *  Creates a new user.
	 * @param user The new user to create.
	 */
	@Security('adminAuth')
	@Response<ErrorResponse>(501, 'Server error')
	@Post()
	public async createUser(@Body() user: User): Promise<void> {
		return await UsersBlSingleton.createUser(user);
	}
	/**
	 * NEVER let anyone get hashed password.
	 * @param user user to remove password from.
	 */
	private cleanUpUserBeforeRelease(user: User): User {
		const userCopy = DeepCopy<User>(user);
		delete userCopy.password;
		return userCopy;
	}

	/**
	 * NEVER let anyone get hashed password.
	 * @param users users to remove password from.
	 */
	private cleanUpUsersBeforRelease(users: User[]): User[] {
		const usersCopy: User[] = [];
		for (const user of users) {
			usersCopy.push(this.cleanUpUserBeforeRelease(user));
		}
		return usersCopy;
	}

	/**
	 * Only admin can watch/update/delete other users.
	 */
	private isUserAllowed(userSession: User, userIdInReq): void {
		/**
		 * Only admin can update other user.
		 */
		if (userSession.scope !== 'adminAuth' && userSession.email !== userIdInReq) {
			throw {
				responseCode: 4403,
				message: 'user not allowed to watch other accounts',
			} as ErrorResponse;
		}
	}
}
