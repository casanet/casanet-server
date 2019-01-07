import { Configuration } from '../config';
import { IDataIO } from '../models/backendInterfaces';
import { User } from '../models/sharedInterfaces';
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
    public async deleteUser(user: User): Promise<void> {
        const originalUser = this.findUser(user.email);

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
}

export const UsersDalSingleton = new UsersDal(new DataIO(USERS_FILE_NAME));
