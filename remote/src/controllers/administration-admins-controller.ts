import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
import { SchemaValidator } from '../../../backend/src/security/schemaValidator';
import { createUser, deleteUser, getUser, getUsers, updateUser } from '../data-access';
import { RemoteAdmin } from '../models';
import { createUserSchema, updateUserSchema } from '../security/schemaValidator';

@Tags('Admins')
@Route('admins')
export class AdministrationUsersController extends Controller {

    /**
     * Get admin profile.
     * @returns Admin.
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
     * @returns Admins array.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getUsers(): Promise<RemoteAdmin[]> {
        return await getUsers();
    }

    /**
     * Get admin by email.
     * @returns Admin.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('{userId}')
    public async getUser(userId: string): Promise<RemoteAdmin> {
        return await getUser(userId);
    }

    /**
     * Update administraion admin properties.
     * @param adminId Admin email.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{userId}')
    public async setUser(userId: string, @Body() user: RemoteAdmin): Promise<void> {
        try {
            user = await SchemaValidator(user, updateUserSchema);
        } catch (err) {
            this.setStatus(422);
            return err.error.message;
        }

        user.email = userId;
        await updateUser(user);
    }

    /**
     * Delete admin user from the administraion system.
     * @param adminId Admin email.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{userId}')
    public async deleteUser(userId: string): Promise<void> {
        return await deleteUser(userId);
    }

    /**
     *  Creates a new administraion admin.
     * @param admin The new admin to create.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createUser(@Body() admin: RemoteAdmin): Promise<void> {
        try {
            admin = await SchemaValidator(admin, createUserSchema);
        } catch (err) {
            this.setStatus(422);
            return err.error.message;
        }
        return await createUser(admin);
    }
}
