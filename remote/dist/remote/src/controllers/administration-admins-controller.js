"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const tsoa_1 = require("tsoa");
const data_access_1 = require("../data-access");
const models_1 = require("../models");
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
const schemaValidator_2 = require("../security/schemaValidator");
let AdministrationUsersController = class AdministrationUsersController extends tsoa_1.Controller {
    /**
     * Get admin profile.
     * @returns Admin.
     */
    async getProfile(request) {
        const email = request.user;
        return await data_access_1.getUser(email);
    }
    /**
     * Get all admin users in the administraion system.
     * @returns Admins array.
     */
    async getUsers() {
        return await data_access_1.getUsers();
    }
    /**
     * Get admin by email.
     * @returns Admin.
     */
    async getUser(userId) {
        return await data_access_1.getUser(userId);
    }
    /**
     * Update administraion admin properties.
     * @param adminId Admin email.
     */
    async setUser(userId, user) {
        try {
            user = await schemaValidator_1.SchemaValidator(user, schemaValidator_2.updateUserSchema);
        }
        catch (err) {
            this.setStatus(422);
            return err.error.message;
        }
        user.email = userId;
        await data_access_1.updateUser(user);
    }
    /**
     * Delete admin user from the administraion system.
     * @param adminId Admin email.
     */
    async deleteUser(userId) {
        return await data_access_1.deleteUser(userId);
    }
    /**
     *  Creates a new administraion admin.
     * @param admin The new admin to create.
     */
    async createUser(admin) {
        try {
            admin = await schemaValidator_1.SchemaValidator(admin, schemaValidator_2.createUserSchema);
        }
        catch (err) {
            this.setStatus(422);
            return err.error.message;
        }
        return await data_access_1.createUser(admin);
    }
};
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('profile'),
    __param(0, tsoa_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdministrationUsersController.prototype, "getProfile", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdministrationUsersController.prototype, "getUsers", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('{userId}'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdministrationUsersController.prototype, "getUser", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('{userId}'),
    __param(1, tsoa_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, models_1.RemoteAdmin]),
    __metadata("design:returntype", Promise)
], AdministrationUsersController.prototype, "setUser", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Delete('{userId}'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdministrationUsersController.prototype, "deleteUser", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post(),
    __param(0, tsoa_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [models_1.RemoteAdmin]),
    __metadata("design:returntype", Promise)
], AdministrationUsersController.prototype, "createUser", null);
AdministrationUsersController = __decorate([
    tsoa_1.Tags('Admins'),
    tsoa_1.Route('admins')
], AdministrationUsersController);
exports.AdministrationUsersController = AdministrationUsersController;
//# sourceMappingURL=administration-admins-controller.js.map