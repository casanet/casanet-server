"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcrypt");
const config_1 = require("../config");
const logger_1 = require("../utilities/logger");
const macAddress_1 = require("../utilities/macAddress");
const dataIO_1 = require("./dataIO");
const USERS_FILE_NAME = 'users.json';
class UsersDal {
    constructor(dataIo) {
        /**
         * users.
         */
        this.users = [];
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
    async setDefaultUser() {
        /** Get password from configuration, and hash it like any other password in system */
        const passwordHash = bcrypt.hashSync(config_1.Configuration.defaultUser.password, config_1.Configuration.keysHandling.bcryptSaltRounds);
        /** Extract user domain from configuration */
        const userNameDomain = config_1.Configuration.defaultUser.email.split('@')[1];
        /**
         * Used machine address as default user name.
         * This is for security issues when users not replacing default user,
         * and attackers can access server with known default user.
         */
        const userName = await macAddress_1.GetMachinMacAddress();
        /** Build default user email address */
        const defaultUserName = `${userName}@${userNameDomain}`;
        this.users.push({
            displayName: config_1.Configuration.defaultUser.displayName,
            email: defaultUserName,
            ignoreTfa: config_1.Configuration.defaultUser.ignoreTfa,
            password: passwordHash,
            scope: config_1.Configuration.defaultUser.scope,
            sessionTimeOutMS: config_1.Configuration.defaultUser.sessionTimeOutMS,
        });
        logger_1.logger.warn(`There is no any user in system, using default user to allow first time access,` +
            ` user name is: ${defaultUserName} and for password see casanet.json file.` +
            ` for system secure, please create valid user and remove the default user.`);
    }
    /**
     * Find user in users array
     */
    findUser(email) {
        for (const user of this.users) {
            if (user.email === email) {
                return user;
            }
        }
    }
    /**
     * Get all users as array.
     */
    async getUsers() {
        return this.users;
    }
    /**
     * Get users by user email.
     * @param email Find user by key.
     */
    async getUser(email) {
        const user = this.findUser(email);
        if (!user) {
            throw {
                responseCode: 5404,
                message: 'user not exist',
            };
        }
        return user;
    }
    /**
     * Save new users.
     */
    async createUser(newUser) {
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
    async deleteUser(userEmail) {
        const originalUser = this.findUser(userEmail);
        if (!originalUser) {
            throw {
                responseCode: 5404,
                message: 'user not exist',
            };
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
    async updateUser(userToUpdate) {
        const originalUser = this.findUser(userToUpdate.email);
        if (!originalUser) {
            throw {
                responseCode: 5404,
                message: 'user not exist',
            };
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
exports.UsersDal = UsersDal;
exports.UsersDalSingleton = new UsersDal(new dataIO_1.DataIO(USERS_FILE_NAME));
//# sourceMappingURL=usersDal.js.map