import * as WebSocket from 'ws';
import { ChannelsController } from '../controllers/channels-controller';

export class ChannelsRouter {

    private channelsController: ChannelsController = new ChannelsController();

    /**
     * Route incoming ws connections.
     * @param wss Web socket server object.
     */
    public IncomingWsChannels(wss: WebSocket.Server): void {
        /** When new client connect send it to controller handle it */
        wss.on('connection', (ws: WebSocket) => {
            this.channelsController.OnChannelOpend(ws);
        });
    }
}
