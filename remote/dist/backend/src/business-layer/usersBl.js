"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cryptoJs = require("crypto-js");
const usersDal_1 = require("../data-layer/usersDal");
const schemaValidator_1 = require("../security/schemaValidator");
class UsersBl {
    /**
     * Init users bl. using dependecy injection pattern to allow units testings.
     * @param usersDal Inject the dal instance.
     */
    constructor(usersDal) {
        this.usersDal = usersDal;
    }
    /**
     * Validatete and senitize user from client.
     * @param user user to validate.
     * @param isNewUser is user sent to create new one (it's little difference schemas update/create user)
     * @returns A sanitizeUser object.
     */
    async validateUser(user, isNewUser) {
        /**
         * Valid data by validator.
         */
        const sanitizeUser = await schemaValidator_1.SchemaValidator(user, isNewUser ? schemaValidator_1.UserSchema : schemaValidator_1.UserUpdateSchema)
            .catch((validationError) => {
            throw {
                responseCode: 2422,
                message: validationError.error.message,
            };
        });
        /**
         * If there is password to hash, hash it, else load the original password hash.
         */
        if (sanitizeUser.password) {
            sanitizeUser.password = cryptoJs.SHA256(sanitizeUser.password).toString();
        }
        else {
            const originalUser = await this.usersDal.getUser(sanitizeUser.email);
            sanitizeUser.password = originalUser.password;
        }
        return sanitizeUser;
    }
    /**
     * Get all users.
     */
    async getUsers() {
        return await this.usersDal.getUsers();
    }
    /**
     * Gets user by user email, or reject if not exist.
     * @param email session key
     * @returns user, or inject if not exist.
     */
    async getUser(email) {
        return await this.usersDal.getUser(email);
    }
    /**
     * Create new user.
     * @param user User to create.
     */
    async createUser(user) {
        const sanitizeUser = await this.validateUser(user, true);
        /**
         * make sure there is no other user with same email in system.
         */
        try {
            await this.usersDal.getUser(sanitizeUser.email);
        }
        catch (error) {
            await this.usersDal.createUser(sanitizeUser);
            return;
        }
        throw {
            responseCode: 5405,
            message: 'user already exist',
        };
    }
    /**
     * Update any properties of user.
     * @param userToUpdate User object to update.
     */
    async updateUser(userToUpdate) {
        const sanitizeUser = await this.validateUser(userToUpdate, false);
        await this.usersDal.updateUser(sanitizeUser);
    }
    /**
     * Delete user.
     * @param userSession Current sessiohn user.
     */
    async deleteUser(userEmail) {
        return await this.usersDal.deleteUser(userEmail);
    }
}
exports.UsersBl = UsersBl;
exports.UsersBlSingleton = new UsersBl(usersDal_1.UsersDalSingleton);
//# sourceMappingURL=usersBl.js.map