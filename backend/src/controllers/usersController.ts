import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse, User } from '../models/sharedInterfaces';
import { UsersBlSingleton } from '../business-layer/usersBl';

@Tags('Users')
@Route('users')
export class UsersController extends Controller {

    /**
     * NEVER let anyone get hashed password.
     * @param user user to remove password from.
     */
    private cleanUpUserBeforRelease(user: User): User {
        delete user.password;
        return user;
    }

    /**
     * NEVER let anyone get hashed password.
     * @param users users to remove password from.
     */
    private cleanUpUsersBeforRelease(users: User[]): User[] {
        for (const user of users) {
            this.cleanUpUserBeforRelease(user);
        }
        return users;
    }

    /**
     * Only admin can watch/update/delete other users.
     */
    private isUserAllowd(userSession: User, userIdInReq): void {
        /**
            * Only admin can update other user.
                 */
        if (userSession.scope !== 'adminAuth' && userSession.email !== userIdInReq) {
            throw {
                responseCode: 4003,
                message: 'user not allowd to watch other account',
            } as ErrorResponse;
        }
    }

    /**
     * Get all users in system.
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
        this.isUserAllowd(request.user, userId);
        return this.cleanUpUserBeforRelease(await UsersBlSingleton.getUser(userId));
    }

    /**
     * Update user values.
     * @param userId User id.
     * @param timing User object to update to.
     */
    @Security('adminAuth')
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{userId}')
    public async setUser(userId: string, @Request() request: express.Request, @Body() user: User): Promise<void> {
        this.isUserAllowd(request.user, userId);
        user.email = userId;
        return await UsersBlSingleton.updateUser(user);
    }

    /**
     * Delete user from system.
     * @param timingId User id.
     */
    @Security('adminAuth')
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{userId}')
    public async deleteUser(userId: string, @Request() request: express.Request): Promise<void> {
        this.isUserAllowd(request.user, userId);
        return await UsersBlSingleton.deleteUser(userId);
    }

    /**
     *  Creates new user.
     * @param timing new user to create.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createUser(@Body() user: User): Promise<void> {
        return await UsersBlSingleton.createUser(user);
    }
}
