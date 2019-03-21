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
const forwardAuthBl_1 = require("../business-layer/forwardAuthBl");
/**
 * Because that express response object needs in auth logic (to write cookies)
 * The TSOA routing is for documentation only.
 * and one day i will extends TSOA lib to support response in parameter inject like request object.
 */
let ForwardAuthController = class ForwardAuthController extends tsoa_1.Controller {
    /**
     * Login to local server via remote server channel.
     * If users exsits in more then one local server, it`s return status code 210 and the avalible user servers to select.
     */
    async login(request, response, login) {
        return await forwardAuthBl_1.ForwardAuthBlSingleton.login(request, response, login);
    }
    /**
     * 2-step verification login to local server via remote server channel.
     */
    async loginTfa(request, response, login) {
        return await forwardAuthBl_1.ForwardAuthBlSingleton.loginTfa(request, response, login);
    }
    /**
     * Logout manualy from remote and local systems.
     */
    async logout(request, response, forwardUserSession) {
        return await forwardAuthBl_1.ForwardAuthBlSingleton.logout(request, response, forwardUserSession);
    }
    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////
    /**
     * Login to local server via remote server channel.
     * If users exists in more then one local server, it returns status code 210 and the available user servers to select.
     */
    async loginDocumentation(request, login) {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
    /**
     * 2-step verification login to local server via remote server channel.
     */
    async loginTfaDocumentation(request, login) {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
    /**
     * Logout manually from remote and local server systems.
     */
    async logoutDocumentation() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
};
__decorate([
    tsoa_1.Response(201, '2-fatore code sent'),
    tsoa_1.Response(210, 'select local server to connect to'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Response(403, 'Auth fail'),
    tsoa_1.Response(422, 'Invalid schema'),
    tsoa_1.Post('login'),
    __param(0, tsoa_1.Request()), __param(1, tsoa_1.Body())
], ForwardAuthController.prototype, "loginDocumentation", null);
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Response(403, 'Auth fail'),
    tsoa_1.Response(422, 'Invalid schema'),
    tsoa_1.Post('login/tfa'),
    __param(0, tsoa_1.Request()), __param(1, tsoa_1.Body())
], ForwardAuthController.prototype, "loginTfaDocumentation", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('logout')
], ForwardAuthController.prototype, "logoutDocumentation", null);
ForwardAuthController = __decorate([
    tsoa_1.Tags('Authentication'),
    tsoa_1.Route('auth')
], ForwardAuthController);
exports.ForwardAuthController = ForwardAuthController;
//# sourceMappingURL=forwardAuthController.js.map