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
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
const logger_1 = require("../../../backend/src/utilities/logger");
const channels_1 = require("../logic/channels");
const schemaValidator_2 = require("../security/schemaValidator");
let ChannelsController = class ChannelsController extends tsoa_1.Controller {
    /**
     * Handle new channel from local server.
     * @param wsChannels client web socket channel.
     */
    OnChannelOpend(wsChannels) {
        /** When message arrived, try parse it to 'LocalMessage' and send it to BL */
        wsChannels.on('message', async (msg) => {
            try {
                const localMessage = await schemaValidator_1.SchemaValidator(JSON.parse(msg), schemaValidator_2.LocalMessageSchema);
                channels_1.ChannelsSingleton.onWsMessage(wsChannels, localMessage);
            }
            catch (error) {
                logger_1.logger.debug('ws message parse fail.');
            }
        });
        wsChannels.on('close', () => {
            channels_1.ChannelsSingleton.onWsClose(wsChannels);
            logger_1.logger.debug(`web secket closed`);
        });
        wsChannels.on('error', (err) => {
            logger_1.logger.warn(`web secket error: ${err.message}`);
        });
        /** Tell BL about new ws channel */
        channels_1.ChannelsSingleton.onWsOpen(wsChannels);
    }
    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////
    /**
     * Web-sockets path, used for the local server to connect remote server.
     */
    async connectToRemoteViaWsDocumentation() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
};
__decorate([
    tsoa_1.Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChannelsController.prototype, "connectToRemoteViaWsDocumentation", null);
ChannelsController = __decorate([
    tsoa_1.Tags('Channels'),
    tsoa_1.Route('channels')
], ChannelsController);
exports.ChannelsController = ChannelsController;
//# sourceMappingURL=channels-controller.js.map