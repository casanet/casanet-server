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
const jwt = require("jsonwebtoken");
const momoent = require("moment");
const randomstring = require("randomstring");
const tsoa_1 = require("tsoa");
const config_1 = require("../../../backend/src/config");
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
const logger_1 = require("../../../backend/src/utilities/logger");
const mailSender_1 = require("../../../backend/src/utilities/mailSender");
const data_access_1 = require("../data-access");
const authentication_1 = require("../security/authentication");
const jwtExpiresIn = process.env.ADMIN_JWT_EXPIRES_IN || '2 days';
const tfaLogins = {};
/**
 * Manage admins authentication in system.
 */
let AdministrationAuthController = class AdministrationAuthController extends tsoa_1.Controller {
    async activeSession(admin) {
        const token = jwt.sign({
            email: admin.email,
        }, authentication_1.jwtSecret, {
            expiresIn: jwtExpiresIn,
        });
        /**
         * Finally load session on cookies response.
         */
        // tslint:disable-next-line:max-line-length
        this.setHeader('Set-Cookie', `session=${token}; Max-Age=${2.592e+6}; Path=/; HttpOnly; ${config_1.Configuration.http.useHttps || process.env.APP_BEHIND_PROXY_REDIRECT_HTTPS ? 'Secure' : ''}; SameSite=Strict`);
    }
    /**
     * Login to the administration system.
     */
    async administrationLogin(login) {
        try {
            login = await schemaValidator_1.SchemaValidator(login, schemaValidator_1.LoginSchema);
        }
        catch (err) {
            this.setStatus(422);
            return err.error.message;
        }
        const admin = await data_access_1.checkAdminAccess(login);
        if (!admin) {
            this.setStatus(401);
            return;
        }
        /** Case user not require MFA, the login prossess done. */
        if (admin.ignoreTfa) {
            return await this.activeSession(admin);
        }
        /** Case user require MFA but email account not properly sets, send error message about it. */
        if (!config_1.Configuration.twoStepsVerification.TwoStepEnabled) {
            logger_1.logger.warn(`User try to login but there is no support in tfa right now`);
            this.setStatus(501);
            return;
        }
        /** Generate random MFA key. */
        const tfaKey = randomstring.generate({
            charset: 'numeric',
            length: 6,
        });
        try {
            /** Try to send MFA key to user email. */
            await mailSender_1.SendMail(admin.email, tfaKey);
        }
        catch (error) {
            /** Case sending fail leet hime know it. */
            logger_1.logger.error(`Mail API problem, ${error.message}`);
            this.setStatus(501);
            return;
        }
        /** Map generated key to user. */
        tfaLogins[admin.email] = {
            generatedKey: tfaKey,
            timeStamp: new Date(),
        };
        /** Mark status to 201, means, the login is OK but needs extra, MFA. */
        this.setStatus(201);
    }
    /**
     * 2-step verification login to the administration system.
     */
    async administrationLoginTfa(login) {
        try {
            login = await schemaValidator_1.SchemaValidator(login, schemaValidator_1.LoginSchema);
        }
        catch (err) {
            this.setStatus(422);
            return err.error.message;
        }
        /** Get MFA key if exists */
        const tfaData = tfaLogins[login.email];
        /**
         * If user request MFA in last 5 minutes, and MFA key same as generated, let user pass.
         */
        if (tfaData &&
            tfaData.generatedKey === login.password &&
            new Date().getTime() - tfaData.timeStamp.getTime() < momoent.duration(5, 'minutes').asMilliseconds()) {
            delete tfaLogins[login.email];
            const admin = await data_access_1.checkAdminAccess(login);
            if (!admin) {
                this.setStatus(401);
                return;
            }
            return await this.activeSession(admin);
        }
        /** Any other case, return generic error. */
        this.setStatus(401);
    }
    /**
     * Logout manually from the administration system.
     */
    async administrationLogout() {
        /** Currently there is no blacklist of invalid tokens */
        /** Send clean session by response to client browser. */
        this.setHeader('Set-Cookie', `session=0;  Path=/;`);
    }
};
__decorate([
    tsoa_1.Response(201, '2-fatore code sent'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Response(403, 'Auth fail'),
    tsoa_1.Response(422, 'Invalid schema'),
    tsoa_1.Post('login'),
    __param(0, tsoa_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdministrationAuthController.prototype, "administrationLogin", null);
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Response(403, 'Auth fail'),
    tsoa_1.Response(422, 'Invalid schema'),
    tsoa_1.Post('login/tfa'),
    __param(0, tsoa_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdministrationAuthController.prototype, "administrationLoginTfa", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdministrationAuthController.prototype, "administrationLogout", null);
AdministrationAuthController = __decorate([
    tsoa_1.Tags('Administration'),
    tsoa_1.Route('/administration/auth')
], AdministrationAuthController);
exports.AdministrationAuthController = AdministrationAuthController;
//# sourceMappingURL=administration-auth-controller.js.map