import { Configuration } from '../config';
import { IDataIO } from '../models/backendInterfaces';
import { User, ErrorResponse } from '../models/sharedInterfaces';
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
            this.users = [Configuration.defaultUser];
        }
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
            throw new Error('user not exist');
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
            throw new Error('user not exist');
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
                responseCode : 4004,
                message: 'timing not exist',
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
