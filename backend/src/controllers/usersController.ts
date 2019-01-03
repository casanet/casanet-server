import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse, User } from '../models/sharedInterfaces';

@Tags('Users')
@Route('users')
export class UsersController extends Controller {

    /**
     * Get all users in system.
     * @returns Users array.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getUsers(): Promise<User[]> {
        return [];
        // TODO: await new DevicesService().get(id);
    }

    /**
     * Get user by id.
     * @returns User.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('{userId}')
    public async getUser(userId: string): Promise<User> {
        return;
        // TODO: await new DevicesService().get(id);
    }

    /**
     * Update user values.
     * @param userId User id.
     * @param timing User object to update to.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{userId}')
    public async setUser(userId: string, @Body() user: User): Promise<void> {
        // TODO ...
        return;
    }

    /**
     * Delete user from system.
     * @param timingId User id.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{userId}')
    public async deleteUser(userId: string): Promise<void> {
        // TODO ...
        return;
    }

    /**
     *  Creates new user.
     * @param timing new user to create.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createUser(@Body() user: User): Promise<void> {
        // TODO ...
        return;
    }
}
