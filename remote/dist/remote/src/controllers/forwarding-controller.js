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
const tsoa_1 = require("tsoa");
const channels_1 = require("../logic/channels");
let ForwardingController = class ForwardingController extends tsoa_1.Controller {
    /**
     * Forward each request to local server to handle it, as is.
     */
    async forwardHttpReq(localServerId, httpRequest) {
        return await channels_1.ChannelsSingleton.sendHttpViaChannels(localServerId, httpRequest);
    }
    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////
    /**
     * Forward each /API/ifttt/trigger/** path to the local server to handle it AS IS.
     */
    async apiForwardingIftttDocumentation() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
    /**
     * Forward each /API/** path to the local server to handle it AS IS.
     */
    async apiForwardingDocumentation() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
};
__decorate([
    tsoa_1.Security('iftttAuth'),
    tsoa_1.Post('ifttt/trigger/**/*'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ForwardingController.prototype, "apiForwardingIftttDocumentation", null);
__decorate([
    tsoa_1.Security('forwardAuth'),
    tsoa_1.Get('**/*'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ForwardingController.prototype, "apiForwardingDocumentation", null);
ForwardingController = __decorate([
    tsoa_1.Tags('Forwarding'),
    tsoa_1.Route('API')
], ForwardingController);
exports.ForwardingController = ForwardingController;
//# sourceMappingURL=forwarding-controller.js.map