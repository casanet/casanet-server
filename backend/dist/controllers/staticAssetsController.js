"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
let StaticAssetsController = class StaticAssetsController extends tsoa_1.Controller {
    /**
     * Get public assets of casa-net client side.
     */
    async getStaticsAssets() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
};
__decorate([
    tsoa_1.Response(404, 'Page not found'),
    tsoa_1.Get('**/*')
], StaticAssetsController.prototype, "getStaticsAssets", null);
StaticAssetsController = __decorate([
    tsoa_1.Tags('Public'),
    tsoa_1.Route('static')
], StaticAssetsController);
exports.StaticAssetsController = StaticAssetsController;
//# sourceMappingURL=staticAssetsController.js.map