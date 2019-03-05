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
const usersBl_1 = require("../../../backend/src/business-layer/usersBl");
const deepCopy_1 = require("../../../backend/src/utilities/deepCopy");
let AdministrationUsersController = class AdministrationUsersController extends tsoa_1.Controller {
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
     * Get admin profile.
     * @returns User.
     */
    async getProfile(request) {
        const userSession = request.user;
        return this.cleanUpUserBeforRelease(await usersBl_1.UsersBlSingleton.getUser(userSession.email));
    }
    /**
     * Get all admin users in the administraion system.
     * @returns Users array.
     */
    async getUsers() {
        return this.cleanUpUsersBeforRelease(await usersBl_1.UsersBlSingleton.getUsers());
    }
    /**
     * Get administraion user by id.
     * @returns User.
     */
    async getUser(adminId) {
        return this.cleanUpUserBeforRelease(await usersBl_1.UsersBlSingleton.getUser(adminId));
    }
    /**
     * Update administraion user properties.
     * @param adminId User id.
     */
    async setUser(adminId, user) {
        user.email = adminId;
        return await usersBl_1.UsersBlSingleton.updateUser(user);
    }
    /**
     * Delete admin user from the administraion system.
     * @param adminId User id.
     */
    async deleteUser(adminId) {
        return await usersBl_1.UsersBlSingleton.deleteUser(adminId);
    }
    /**
     *  Creates a new administraion user.
     * @param user The new administraion to create.
     */
    async createUser(user) {
        return await usersBl_1.UsersBlSingleton.createUser(user);
    }
};
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('profile'),
    __param(0, tsoa_1.Request())
], AdministrationUsersController.prototype, "getProfile", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get()
], AdministrationUsersController.prototype, "getUsers", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('{adminId}')
], AdministrationUsersController.prototype, "getUser", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('{adminId}'),
    __param(1, tsoa_1.Body())
], AdministrationUsersController.prototype, "setUser", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Delete('{adminId}')
], AdministrationUsersController.prototype, "deleteUser", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post(),
    __param(0, tsoa_1.Body())
], AdministrationUsersController.prototype, "createUser", null);
AdministrationUsersController = __decorate([
    tsoa_1.Tags('Administration'),
    tsoa_1.Route('administration/users/')
], AdministrationUsersController);
exports.AdministrationUsersController = AdministrationUsersController;
//# sourceMappingURL=administrationUsersController.js.map