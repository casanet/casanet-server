import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { HttpRequest, HttpResponse, LocalMessage } from '../../../backend/src/models/remote2localProtocol';
import { ChannelsSingleton } from '../logic/channels';

@Tags('Forwarding')
@Route('API')
export class ForwardingController extends Controller {

    /**
     * Forward each request to local server to handle it, as is.
     */
    public async forwardHttpReq(localServerId: string, httpRequest: HttpRequest): Promise<HttpResponse> {
        return await ChannelsSingleton.sendHttpViaChannels(localServerId, httpRequest);
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
    @Security('forwardAuth')
    @Get('**/*')
    public async apiForwardingDocumentation(): Promise<any> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
}
