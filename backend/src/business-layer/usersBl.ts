import * as bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { ValidationResult } from 'joi';
import { Configuration } from '../config';
import { UsersDal, UsersDalSingleton } from '../data-layer/usersDal';
import { ErrorResponse, User } from '../models/sharedInterfaces';
import { SchemaValidator, UserSchema, UserUpdateSchema } from '../security/schemaValidator';

export class UsersBl {
  private usersDal: UsersDal;

  /**
   * Init users bl. using dependecy injection pattern to allow units testings.
   * @param usersDal Inject the dal instance.
   */
  constructor(usersDal: UsersDal) {
    this.usersDal = usersDal;
  }

  /**
   * Get all users.
   */
  public async getUsers(): Promise<User[]> {
    return await this.usersDal.getUsers();
  }

  /**
   * Gets user by user email, or reject if not exist.
   * @param email session key
   * @returns user, or inject if not exist.
   */
  public async getUser(email: string): Promise<User> {
    return await this.usersDal.getUser(email);
  }

  /**
   * Create new user.
   * @param user User to create.
   */
  public async createUser(user: User): Promise<void> {
    const sanitizeUser = (await this.validateUser(user, true)) as User;

    /**
     * make sure there is no other user with same email in system.
     */
    try {
      await this.usersDal.getUser(sanitizeUser.email);
    } catch (error) {
      await this.usersDal.createUser(sanitizeUser);
      return;
    }

    throw {
      responseCode: 5405,
      message: 'user already exist',
    } as ErrorResponse;
  }

  /**
   * Update any properties of user.
   * @param userToUpdate User object to update.
   */
  public async updateUser(userToUpdate: User): Promise<void> {
    const sanitizeUser = (await this.validateUser(userToUpdate, false)) as User;

    await this.usersDal.updateUser(sanitizeUser);
  }

  /**
   * Delete user.
   * @param userSession Current sessiohn user.
   */
  public async deleteUser(userEmail: string): Promise<void> {
    return await this.usersDal.deleteUser(userEmail);
  }

  /**
   * Validatete and senitize user from client.
   * @param user user to validate.
   * @param isNewUser is user sent to create new one (it's little difference schemas update/create user)
   * @returns A sanitizeUser object.
   */
  private async validateUser(user: User, isNewUser: boolean): Promise<User | ErrorResponse> {
    /**
     * Valid data by validator.
     */
    const sanitizeUser: User = await SchemaValidator(user, isNewUser ? UserSchema : UserUpdateSchema).catch(
      (validationError: ValidationResult<any>) => {
        throw {
          responseCode: 2422,
          message: validationError.error.message,
        } as ErrorResponse;
      },
    );

    /**
     * If there is password to hash, hash it, else load the original password hash.
     */
    if (sanitizeUser.password) {
      sanitizeUser.password = await bcrypt.hash(sanitizeUser.password, Configuration.keysHandling.bcryptSaltRounds);
    } else {
      const originalUser = await this.usersDal.getUser(sanitizeUser.email);
      sanitizeUser.password = originalUser.password;
    }
    return sanitizeUser;
  }
}

export const UsersBlSingleton = new UsersBl(UsersDalSingleton);
