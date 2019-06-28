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
const typeorm_1 = require("typeorm");
/**
 * Represents a local server in the system.
 */
let LocalServer = class LocalServer {
    constructor(localServer) {
        this.localServer = localServer;
        if (localServer) {
            Object.assign(this, localServer);
        }
    }
};
__decorate([
    typeorm_1.PrimaryColumn({ name: 'physical_address', type: 'varchar', length: 12, nullable: false }),
    __metadata("design:type", String)
], LocalServer.prototype, "macAddress", void 0);
__decorate([
    typeorm_1.Column({ name: 'display_name', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", String)
], LocalServer.prototype, "displayName", void 0);
__decorate([
    typeorm_1.Column({ name: 'valid_users', type: 'varchar', array: true, nullable: false }),
    __metadata("design:type", Array)
], LocalServer.prototype, "validUsers", void 0);
LocalServer = __decorate([
    typeorm_1.Entity({ name: 'servers' }),
    __metadata("design:paramtypes", [Object])
], LocalServer);
exports.LocalServer = LocalServer;
//# sourceMappingURL=local-server.model.js.map