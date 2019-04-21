import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import * as ws from 'ws';
import { HttpRequest, HttpResponse, LocalMessage } from '../../../backend/src/models/remote2localProtocol';
import { logger } from '../../../backend/src/utilities/logger';
import { CasaWs, ChannelsBlSingleton } from '../business-layer/channelsBl';

@Tags('Forwarding')
@Route('API')
export class ForwardingController extends Controller {

    /**
     * Forward each request to local server to handle it, as is.
     */
    public async forwardHttpReq(localServerId: string, httpRequest: HttpRequest): Promise<HttpResponse> {
        return await ChannelsBlSingleton.sendHttpViaChannels(localServerId, httpRequest);
    }

    /**
     * Forward request  to local server by local server mac address (used for ifttt).
     */
    public async forwardHttpReqByMac(localMac: string, httpRequest: HttpRequest): Promise<HttpResponse> {
        return await ChannelsBlSingleton.sendHttpViaChannelsByMac(localMac, httpRequest);
    }

    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////

    /**
     * Forward each /API/ifttt/trigger/** path to the local server to handle it AS IS.
     */
    @Security('iftttAuth')
    @Post('ifttt/trigger/**/*')
    public async apiForwardingIftttDocumentation(): Promise<any> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }

    /**
     * Forward each /API/** path to the local server to handle it AS IS.
     */
    @Security('userAuth')
    @Get('**/*')
    public async apiForwardingDocumentation(): Promise<any> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
}
