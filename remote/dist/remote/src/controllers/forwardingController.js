"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const channelsBl_1 = require("../business-layer/channelsBl");
let ForwardingController = class ForwardingController extends tsoa_1.Controller {
    /**
     * Forward each request to local server to handle it, as is.
     */
    async forwardHttpReq(localServerId, httpRequest) {
        return await channelsBl_1.ChannelsBlSingleton.sendHttpViaChannels(localServerId, httpRequest);
    }
    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////
    /**
     * Forward each /API/** path to local server to handle it as is.
     */
    async apiForwardingDocumentation() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
};
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Get('**/*')
], ForwardingController.prototype, "apiForwardingDocumentation", null);
ForwardingController = __decorate([
    tsoa_1.Tags('Forwarding'),
    tsoa_1.Route('API')
], ForwardingController);
exports.ForwardingController = ForwardingController;
//# sourceMappingURL=forwardingController.js.map