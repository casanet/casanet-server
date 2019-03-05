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
/**
 * Because that express response object needs in auth logic (to write cookies)
 * The TSOA routing is for documentation only.
 * and one day i will extends TSOA lib to support response in parameter inject like request object.
 */
let AdministrationAuthController = class AdministrationAuthController extends tsoa_1.Controller {
    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////
    /**
     * Login to the administration system.
     */
    async administrationLoginDocumentation(request, login) {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
    /**
     * 2-step verification login to the administration system.
     */
    async administrationLoginTfaDocumentation(request, login) {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
    /**
     * Logout manually from the administration system.
     */
    async administrationLogoutDocumentation() {
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
], AdministrationAuthController.prototype, "administrationLoginDocumentation", null);
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Response(403, 'Auth fail'),
    tsoa_1.Response(422, 'Invalid schema'),
    tsoa_1.Post('login/tfa'),
    __param(0, tsoa_1.Request()), __param(1, tsoa_1.Body())
], AdministrationAuthController.prototype, "administrationLoginTfaDocumentation", null);
__decorate([
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('logout')
], AdministrationAuthController.prototype, "administrationLogoutDocumentation", null);
AdministrationAuthController = __decorate([
    tsoa_1.Tags('Administration'),
    tsoa_1.Route('/administration/auth')
], AdministrationAuthController);
exports.AdministrationAuthController = AdministrationAuthController;
//# sourceMappingURL=administrationAuthController.js.map