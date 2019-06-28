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
const _1 = require(".");
/**
 * Represents a local server in the system.
 */
let ServerSession = class ServerSession {
};
__decorate([
    typeorm_1.PrimaryColumn(),
    typeorm_1.OneToOne((type) => _1.LocalServer),
    typeorm_1.JoinColumn({ name: 'server' }),
    __metadata("design:type", _1.LocalServer)
], ServerSession.prototype, "server", void 0);
__decorate([
    typeorm_1.Column({ name: 'hashed_key', type: 'varchar', length: 256, nullable: false }),
    __metadata("design:type", String)
], ServerSession.prototype, "hashedKey", void 0);
ServerSession = __decorate([
    typeorm_1.Entity({ name: 'servers_sessions' })
], ServerSession);
exports.ServerSession = ServerSession;
//# sourceMappingURL=server-session.models.js.map