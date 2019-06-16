"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const remoteConnectionBl_1 = require("../business-layer/remoteConnectionBl");
const usersBl_1 = require("../business-layer/usersBl");
const deepCopy_1 = require("../utilities/deepCopy");
let UsersController = class UsersController extends tsoa_1.Controller {
    /**
     * NEVER let anyone get hashed password.
     * @param user user to remove password from.
     */
    cleanUpUserBeforRelease(user) {
        const userCopy = deepCopy_1.DeepCopy(user);
        delete userCopy.password;
        return userCopy;
    }
    /**
     * NEVER let anyone get hashed password.
     * @param users users to remove password from.
     */
    cleanUpUsersBeforRelease(users) {
        const usersCopy = [];
        for (const user of users) {
            usersCopy.push(this.cleanUpUserBeforRelease(user));
        }
        return usersCopy;
    }
    /**
     * Only admin can watch/update/delete other users.
     */
    isUserAllowd(userSession, userIdInReq) {
        /**
         * Only admin can update other user.
         */
        if (userSession.scope !== 'adminAuth' && userSession.email !== userIdInReq) {
            throw {
                responseCode: 4403,
                message: 'user not allowed to watch other accounts',
            };
        }
    }
    /**
     * Get user profile.
     * @returns User.
     */
    async getProfile(request) {
        const userSession = request.user;
        return this.cleanUpUserBeforRelease(await usersBl_1.UsersBlSingleton.getUser(userSession.email));
    }
    /**
     * Reqest registration code.
     * @param userId User id/email to send code to.
     */
    async requestUserForwarding(userId) {
        await remoteConnectionBl_1.RemoteConnectionBlSingleton.requestSendUserRegisterCode(userId);
    }
    /**
     * Get registered users for forwarding from remote to local.
     */
    async getRegisteredUsers() {
        return await remoteConnectionBl_1.RemoteConnectionBlSingleton.getRegisteredUsersForRemoteForwarding();
    }
    /**
     *  Register account to allow forward HTTP requests from remote to local server.
     * @param userId User id/email to register.
     */
    async requestUserForwardingAuth(userId, auth) {
        await remoteConnectionBl_1.RemoteConnectionBlSingleton.registerUserForRemoteForwarding(userId, auth.code);
    }
    /**
     * Remove account from local server valid account to forward from remote to local
     * @param userId User id/email to unregister.
     */
    async removeUserForwarding(userId) {
        await remoteConnectionBl_1.RemoteConnectionBlSingleton.unregisterUserFromRemoteForwarding(userId);
    }
    /**
     * Get all users in the system.
     * @returns Users array.
     */
    async getUsers() {
        return this.cleanUpUsersBeforRelease(await usersBl_1.UsersBlSingleton.getUsers());
    }
    /**
     * Get user by id.
     * @returns User.
     */
    async getUser(userId, request) {
        this.isUserAllowd(request.user, userId);
        return this.cleanUpUserBeforRelease(await usersBl_1.UsersBlSingleton.getUser(userId));
    }
    /**
     * Update user properties.
     * @param userId User id.
     * @param user User object to update to.
     */
    async setUser(userId, request, user) {
        const userSession = request.user;
        this.isUserAllowd(userSession, userId);
        user.email = userId;
        /**
         * Never allow user to change own scope.
         */
        if (userSession.scope !== 'adminAuth') {
            user.scope = userSession.scope;
        }
        return await usersBl_1.UsersBlSingleton.updateUser(user);
    }
    /**
     * Delete user from the system.
     * @param userId User id.
     */
    async deleteUser(userId, request) {
        this.isUserAllowd(request.user, userId);
        return await usersBl_1.UsersBlSingleton.deleteUser(userId);
    }
    /**
     *  Creates a new user.
     * @param user The new user to create.
     */
    async createUser(user) {
        return await usersBl_1.UsersBlSingleton.createUser(user);
    }
};
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Security('userAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('profile'),
    __param(0, tsoa_1.Request())
], UsersController.prototype, "getProfile", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('forward-auth/{userId}')
], UsersController.prototype, "requestUserForwarding", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('forward')
], UsersController.prototype, "getRegisteredUsers", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('forward/{userId}'),
    __param(1, tsoa_1.Body())
], UsersController.prototype, "requestUserForwardingAuth", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Delete('forward/{userId}')
], UsersController.prototype, "removeUserForwarding", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get()
], UsersController.prototype, "getUsers", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Security('userAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('{userId}'),
    __param(1, tsoa_1.Request())
], UsersController.prototype, "getUser", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Security('userAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('{userId}'),
    __param(1, tsoa_1.Request()), __param(2, tsoa_1.Body())
], UsersController.prototype, "setUser", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Security('userAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Delete('{userId}'),
    __param(1, tsoa_1.Request())
], UsersController.prototype, "deleteUser", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post(),
    __param(0, tsoa_1.Body())
], UsersController.prototype, "createUser", null);
UsersController = __decorate([
    tsoa_1.Tags('Users'),
    tsoa_1.Route('users')
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=usersController.js.map