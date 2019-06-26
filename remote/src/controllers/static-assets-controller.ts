import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';

@Tags('Public')
@Route('static')
export class StaticsAssetsController extends Controller {

    /**
     * Get public assets for casa-net client side.
     */
    @Response(404, 'Page not found')
    @Get('**/*')
    public async getStaticsAssets(): Promise<any> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
}
