import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { UsersBlSingleton } from '../../../backend/src/business-layer/usersBl';
import { ErrorResponse, User } from '../../../backend/src/models/sharedInterfaces';
import { DeepCopy } from '../../../backend/src/utilities/deepCopy';

@Tags('Administration')
@Route('administration/users/')
export class AdministrationUsersController extends Controller {

    /**
     * NEVER let anyone get hashed password.
     * @param user user to remove password from.
     */
    private cleanUpUserBeforRelease(user: User): User {
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
            usersCopy.push(this.cleanUpUserBeforRelease(user));
        }
        return usersCopy;
    }

    /**
     * Get admin profile.
     * @returns User.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('profile')
    public async getProfile(@Request() request: express.Request): Promise<User> {
        const userSession: User = request.user;
        return this.cleanUpUserBeforRelease(await UsersBlSingleton.getUser(userSession.email));
    }

    /**
     * Get all admin users in system.
     * @returns Users array.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getUsers(): Promise<User[]> {
        return this.cleanUpUsersBeforRelease(await UsersBlSingleton.getUsers());
    }

    /**
     * Get admin user by id.
     * @returns User.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('{adminId}')
    public async getUser(adminId: string): Promise<User> {
        return this.cleanUpUserBeforRelease(await UsersBlSingleton.getUser(adminId));
    }

    /**
     * Update admin user properties.
     * @param adminId User id.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{adminId}')
    public async setUser(adminId: string, @Body() user: User): Promise<void> {
        user.email = adminId;
        return await UsersBlSingleton.updateUser(user);
    }

    /**
     * Delete admin user from system.
     * @param adminId User id.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{adminId}')
    public async deleteUser(adminId: string): Promise<void> {
        return await UsersBlSingleton.deleteUser(adminId);
    }

    /**
     *  Creates new admin user.
     * @param user new admin to create.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createUser(@Body() user: User): Promise<void> {
        return await UsersBlSingleton.createUser(user);
    }
}
