"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const channelsController_1 = require("../controllers/channelsController");
class ChannelsRouter {
    constructor() {
        this.channelsController = new channelsController_1.ChannelsController();
    }
    /**
     * Route incoming ws connections.
     * @param wss Web socket server object.
     */
    IncomingWsChannels(wss) {
        /** When new client connect send it to controller handle it */
        wss.on('connection', (ws) => {
            this.channelsController.OnChannelOpend(ws);
        });
    }
}
exports.ChannelsRouter = ChannelsRouter;
//# sourceMappingURL=channelsRoute.js.map