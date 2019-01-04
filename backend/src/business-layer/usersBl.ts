import { Request, Response } from 'express';
import { Configuration } from '../config';
import { IUsersDataLayer } from '../models/backendInterfaces';
import { User } from '../models/sharedInterfaces';

export class UsersBl {

    private usersDal: IUsersDataLayer;

    /**
     * Init users bl. using dependecy injection pattern to allow units testings.
     * @param usersDal Inject the dal instalce.
     */
    constructor(usersDal: IUsersDataLayer) {

        this.usersDal = usersDal;
    }

    /**
     * Get all users.
     */
    public async getUsers(): Promise<User[]> {
        return this.usersDal.getUsers();
    }

    /**
     * Gets user by user email, or reject if not exist.
     * @param email session key
     * @returns user, or inject if not exist.
     */
    public async getUser(email: string): Promise<User> {
        return this.usersDal.getUser(email);
    }

    /**
     * Create new user.
     * @param user User to create.
     */
    public async createUser(user: User): Promise<void> {
        await this.usersDal.createUser(user);
    }

    /**
     * Delete user.
     * @param user user to delete.
     */
    public async deleteUser(user: User): Promise<void> {
        return this.usersDal.deleteUser(user);
    }
}