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
const authBl_1 = require("../business-layer/authBl");
/**
 * Because that express response object needs in auth logic (to write cookies)
 * The TSOA routing is for documentation only.
 * and one day i will extends TSOA lib to support response in parameter inject like request object.
 */
let AuthController = class AuthController extends tsoa_1.Controller {
    /**
     * Login to system.
     */
    async login(request, response, login) {
        return await authBl_1.AuthBlSingleton.login(response, login);
    }
    /**
     * 2-step verification login.
     */
    async loginTfa(request, response, login) {
        return await authBl_1.AuthBlSingleton.loginTfa(response, login);
    }
    /**
     * LLogout manually from the system.
     */
    async logout(request, response) {
        await authBl_1.AuthBlSingleton.logout(request.cookies.session, response);
    }
    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////
    /**
     * Login.
     */
    async loginDocumentation(request, login) {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
    /**
     * 2-step verification login.
     */
    async loginTfaDocumentation(request, login) {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
    /**
     * Logout manually from the system.
     */
    async logoutDocumentation() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
};
__decorate([
    tsoa_1.Response(201, '2-fatore code sent'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Response(403, 'Auth fail'),
    tsoa_1.Response(422, 'Invalid schema'),
    tsoa_1.Post('login'),
    __param(0, tsoa_1.Request()), __param(1, tsoa_1.Body())
], AuthController.prototype, "loginDocumentation", null);
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Response(403, 'Auth fail'),
    tsoa_1.Response(422, 'Invalid schema'),
    tsoa_1.Post('login/tfa'),
    __param(0, tsoa_1.Request()), __param(1, tsoa_1.Body())
], AuthController.prototype, "loginTfaDocumentation", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('logout')
], AuthController.prototype, "logoutDocumentation", null);
AuthController = __decorate([
    tsoa_1.Tags('Authentication'),
    tsoa_1.Route('auth')
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map