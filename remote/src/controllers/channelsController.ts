import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import * as ws from 'ws';
import { LocalMessage } from '../../../backend/src/models/remote2localProtocol';
import { SchemaValidator } from '../../../backend/src/security/schemaValidator';
import { logger } from '../../../backend/src/utilities/logger';
import { CasaWs, ChannelsBlSingleton } from '../business-layer/channelsBl';
import { LocalMessageSchema } from '../security/schemaValidatorExtend';

@Tags('Channels')
@Route('channels')
export class ChannelsController extends Controller {

    /**
     * Handle new channel from local server.
     * @param wsChannels client web socket channel.
     */
    public OnChannelOpend(wsChannels: ws) {
        /** When message arrived, try parse it to 'LocalMessage' and send it to BL */
        wsChannels.on('message', async (msg) => {
            try {
                const localMessage: LocalMessage = await SchemaValidator(JSON.parse(msg as string), LocalMessageSchema);
                ChannelsBlSingleton.onWsMessage(wsChannels as CasaWs, localMessage);
            } catch (error) {
                logger.debug('message parse fail.');
            }
        });

        wsChannels.on('close', () => {
            ChannelsBlSingleton.onWsClose(wsChannels as CasaWs);
        });

        wsChannels.on('error', (err: Error) => {
            logger.warn(`web secket error: ${err.message}`);
        });

        /** Tell BL about new ws channel */
        ChannelsBlSingleton.onWsOpen(wsChannels);
    }

    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////

    /**
     * Web sockets path, use for local server to connect remote server.
     */
    @Get()
    public async connectToRemoteViaWsDocumentation(): Promise<any> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
}
