"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
const logger_1 = require("../../../backend/src/utilities/logger");
const channelsBl_1 = require("../business-layer/channelsBl");
const schemaValidatorExtend_1 = require("../security/schemaValidatorExtend");
let ChannelsController = class ChannelsController extends tsoa_1.Controller {
    /**
     * Handle new channel from local server.
     * @param wsChannels client web socket channel.
     */
    OnChannelOpend(wsChannels) {
        /** When message arrived, try parse it to 'LocalMessage' and send it to BL */
        wsChannels.on('message', async (msg) => {
            try {
                const localMessage = await schemaValidator_1.SchemaValidator(JSON.parse(msg), schemaValidatorExtend_1.LocalMessageSchema);
                channelsBl_1.ChannelsBlSingleton.onWsMessage(wsChannels, localMessage);
            }
            catch (error) {
                logger_1.logger.debug('message parse fail.');
            }
        });
        wsChannels.on('close', () => {
            channelsBl_1.ChannelsBlSingleton.onWsClose(wsChannels);
        });
        wsChannels.on('error', (err) => {
            logger_1.logger.warn(`web secket error: ${err.message}`);
        });
        /** Tell BL about new ws channel */
        channelsBl_1.ChannelsBlSingleton.onWsOpen(wsChannels);
    }
    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////
    /**
     * Web sockets path, use for local server to connect remote server.
     */
    async connectToRemoteViaWsDocumentation() {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
};
__decorate([
    tsoa_1.Get()
], ChannelsController.prototype, "connectToRemoteViaWsDocumentation", null);
ChannelsController = __decorate([
    tsoa_1.Tags('Channels'),
    tsoa_1.Route('channels')
], ChannelsController);
exports.ChannelsController = ChannelsController;
//# sourceMappingURL=channelsController.js.map