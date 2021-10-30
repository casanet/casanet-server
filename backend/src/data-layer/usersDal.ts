import * as bcrypt from 'bcryptjs';
import { Configuration } from '../config';
import { IDataIO } from '../models/backendInterfaces';
import { ErrorResponse, User } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { getMachineMacAddress } from '../utilities/macAddress';
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

    await this.dataIo.setData(this.users).catch(() => {
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
    await this.dataIo.setData(this.users).catch(() => {
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
    await this.dataIo.setData(this.users).catch(() => {
      this.users.splice(this.users.indexOf(userToUpdate), 1);
      this.users.push(originalUser);
      throw new Error('fail to save user update request');
    });
  }

  /**
   * Set default user.
   * used when system in first use and there is no any user in system, yet.
   */
  private async setDefaultUser() {
		/**
     * Used machine address as default user password.
     * This is for security reasons the default user password is the machine MAC address,
     * So attackers can access server with default user only if they know the machine MAC address.
     */
		 const password = await getMachineMacAddress();

    /** Get password from configuration, and hash it like any other password in system */
    const passwordHash = bcrypt.hashSync(
      password,
      Configuration.keysHandling.bcryptSaltRounds,
    );

    this.users.push({
      displayName: Configuration.defaultUser.displayName,
      email: Configuration.defaultUser.email,
      ignoreTfa: Configuration.defaultUser.ignoreTfa,
      password: passwordHash,
      scope: Configuration.defaultUser.scope,
			passwordChangeRequired: true,
    });

    logger.warn(
      `There is no ANY user in system, using the default user places in the 'casanet.json' configuration file to allow first time access,` +
        ` the default user password is: "${password}" for system secure, PLEASE CHANGE THE DEFAULT PASSWORD.`,
    );
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
}

export const UsersDalSingleton = new UsersDal(new DataIO(USERS_FILE_NAME));
