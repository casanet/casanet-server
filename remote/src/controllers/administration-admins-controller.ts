import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
import { getServersByUser, getUser, getUsers, updateUser, deleteUser, createUser } from '../data-access';
import { RemoteAdmin } from '../models';
import { SchemaValidator } from '../../../backend/src/security/schemaValidator';
import { userSchema } from '../security/schemaValidator';

@Tags('Admins')
@Route('admins')
export class AdministrationUsersController extends Controller {

    /**
     * Get admin profile.
     * @returns User.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('profile')
    public async getProfile(@Request() request: express.Request): Promise<RemoteAdmin> {
        const email = request.user;
        return await getUser(email);
    }

    /**
     * Get all admin users in the administraion system.
     * @returns Users array.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getUsers(): Promise<RemoteAdmin[]> {
        return await getUsers();
    }

    /**
     * Get administraion user by id.
     * @returns User.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('{userId}')
    public async getUser(userId: string): Promise<RemoteAdmin> {
        return await getUser(userId);
    }

    /**
     * Update administraion user properties.
     * @param adminId User id.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{userId}')
    public async setUser(userId: string, @Body() user: RemoteAdmin): Promise<void> {
        try {
            user = await SchemaValidator(user, userSchema);
        } catch (err) {
            this.setStatus(422);
            return;
        }
        user.email = userId;
        return await updateUser(user);
    }

    /**
     * Delete admin user from the administraion system.
     * @param adminId User id.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{userId}')
    public async deleteUser(userId: string): Promise<void> {
        return await deleteUser(userId);
    }

    /**
     *  Creates a new administraion user.
     * @param user The new administraion to create.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createUser(@Body() user: RemoteAdmin): Promise<void> {
        try {
            user = await SchemaValidator(user, userSchema);
        } catch (err) {
            this.setStatus(422);
            return;
        }
        return await createUser(user);
    }
}
