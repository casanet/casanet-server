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
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const typeorm_1 = require("typeorm");
/**
 * Represents a local server in the system.
 */
let RemoteAdmin = class RemoteAdmin {
    constructor(remoteAdmin) {
        this.remoteAdmin = remoteAdmin;
        if (remoteAdmin) {
            Object.assign(this, remoteAdmin);
        }
    }
    beforeInsert() {
        this.password = bcrypt.hashSync(this.password, 12);
    }
    beforeUpdate() {
        if (this.password) {
            this.beforeInsert();
        }
    }
};
__decorate([
    typeorm_1.PrimaryColumn({ name: 'email', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], RemoteAdmin.prototype, "email", void 0);
__decorate([
    typeorm_1.Column({ name: 'display_name', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], RemoteAdmin.prototype, "displayName", void 0);
__decorate([
    typeorm_1.Column({ name: 'password', type: 'varchar', length: 256, nullable: false, select: false }),
    __metadata("design:type", String)
], RemoteAdmin.prototype, "password", void 0);
__decorate([
    typeorm_1.Column({ name: 'ignore_tfa', type: 'boolean', nullable: false }),
    __metadata("design:type", Boolean)
], RemoteAdmin.prototype, "ignoreTfa", void 0);
__decorate([
    typeorm_1.BeforeInsert(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RemoteAdmin.prototype, "beforeInsert", null);
__decorate([
    typeorm_1.BeforeUpdate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RemoteAdmin.prototype, "beforeUpdate", null);
RemoteAdmin = __decorate([
    typeorm_1.Entity({ name: 'admins' }),
    __metadata("design:paramtypes", [Object])
], RemoteAdmin);
exports.RemoteAdmin = RemoteAdmin;
//# sourceMappingURL=admin.model.js.map