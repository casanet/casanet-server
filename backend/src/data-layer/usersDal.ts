import * as cryptoJs from 'crypto-js';
import { Configuration } from '../config';
import { IDataIO } from '../models/backendInterfaces';
import { ErrorResponse, User } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { GetMachinMacAddress } from '../utilities/macAddress';
import { DataIO } from './dataIO';

const USERS_FILE_NAME = 'users.json';

export class UsersDal {

    private dataIo: IDataIO;

    /**
     * users.
     */
    private users: User[] = [];

    constructor(dataIo: IDataIO) {
        this.dataIo = dataIo;

        this.users = dataIo.getDataSync();

        if (this.users.length === 0) {
            this.setDefaultUser();
        }
    }

    /**
     * Set default user.
     * used when system in first use and there is no any user in system, yet.
     */
    private async setDefaultUser() {
        /** Get password from configuration, and hash it like any other password in system */
        const passwordHash = cryptoJs.SHA256(Configuration.defaultUser.password).toString();

        /** Extract user domain from configuration */
        const userNameDomain = Configuration.defaultUser.email.split('@')[1];
        /**
         * Used machine address as default user name.
         * This is for security issues when users not replacing default user,
         * and attackers can access server with known default user.
         */
        const userName = await GetMachinMacAddress();
        /** Build default user email address */
        const defaultUserName = `${userName}@${userNameDomain}`;

        this.users.push({
            displayName: Configuration.defaultUser.displayName,
            email: defaultUserName,
            ignoreTfa: Configuration.defaultUser.ignoreTfa,
            password: passwordHash,
            scope: Configuration.defaultUser.scope,
            sessionTimeOutMS: Configuration.defaultUser.sessionTimeOutMS,
        });

        logger.warn(`There is no any user in system, using default user to allow first time access,` +
            ` user name is: ${defaultUserName} and for password see casanet.json file.` +
            ` for system secure, please create valid user and remove the default user.`);
    }

    /**
     * Find user in users array
     */
    private findUser(email: string): User {
        for (const user of this.users) {
            if (user.email === email) {
                return user;
            }
        }
    }

    /**
     * Get all users as array.
     */
    public async getUsers(): Promise<User[]> {
        return this.users;
    }

    /**
     * Get users by user email.
     * @param email Find user by key.
     */
    public async getUser(email: string): Promise<User> {
        const user = this.findUser(email);

        if (!user) {
            throw {
                responseCode: 5404,
                message: 'user not exist',
            } as ErrorResponse;
        }
        return user;
    }

    /**
     * Save new users.
     */
    public async createUser(newUser: User): Promise<void> {
        this.users.push(newUser);

        await this.dataIo.setData(this.users)
            .catch(() => {
                this.users.splice(this.users.indexOf(newUser), 1);
                throw new Error('fail to save user');
            });
    }

    /**
     * Delete users.
     */
    public async deleteUser(userEmail: string): Promise<void> {
        const originalUser = this.findUser(userEmail);

        if (!originalUser) {
            throw {
                responseCode: 5404,
                message: 'user not exist',
            } as ErrorResponse;
        }

        this.users.splice(this.users.indexOf(originalUser), 1);
        await this.dataIo.setData(this.users)
            .catch(() => {
                this.users.push(originalUser);
                throw new Error('fail to save user delete request');
            });
    }

    /**
     * Update User.
     * @param userToUpdate User to update to.
     */
    public async updateUser(userToUpdate: User): Promise<void> {
        const originalUser = this.findUser(userToUpdate.email);

        if (!originalUser) {
            throw {
                responseCode: 5404,
                message: 'user not exist',
            } as ErrorResponse;
        }

        this.users.splice(this.users.indexOf(originalUser), 1);
        this.users.push(userToUpdate);
        await this.dataIo.setData(this.users)
            .catch(() => {
                this.users.splice(this.users.indexOf(userToUpdate), 1);
                this.users.push(originalUser);
                throw new Error('fail to save user update request');
            });
    }
}

export const UsersDalSingleton = new UsersDal(new DataIO(USERS_FILE_NAME));
