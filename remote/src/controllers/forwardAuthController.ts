import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse, User } from '../../../backend/src/models/sharedInterfaces';
import { ForwardAuthBlSingleton } from '../business-layer/forwardAuthBl';
import { ForwardUserSession } from '../models/remoteInterfaces';
import { LocalServerInfo, LoginLocalServer } from '../models/sharedInterfaces';

/**
 * Because that express response object needs in auth logic (to write cookies)
 * The TSOA routing is for documentation only.
 * and one day i will extends TSOA lib to support response in parameter inject like request object.
 */
@Tags('Authentication')
@Route('auth')
export class ForwardAuthController extends Controller {

    /**
     * Login to local server via remote server channel.
     * If users exsits in more then one local server, it`s return status code 210 and the avalible user servers to select.
     */
    public async login(request: express.Request, response: express.Response, login: LoginLocalServer): Promise<void | LocalServerInfo[]> {
        return await ForwardAuthBlSingleton.login(request, response, login);
    }

    /**
     * 2-step verification login to local server via remote server channel.
     */
    public async loginTfa(request: express.Request, response: express.Response, login: LoginLocalServer): Promise<void> {
        return await ForwardAuthBlSingleton.loginTfa(request, response, login);
    }

    /**
     * Logout manualy from remote and local systems.
     */
    public async logout(request: express.Request, response: express.Response, forwardUserSession: ForwardUserSession): Promise<void> {
        return await ForwardAuthBlSingleton.logout(request, response, forwardUserSession);
    }

    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////

    /**
     * Login to local server via remote server channel.
     * If users exists in more then one local server, it returns status code 210 and the available user servers to select.
     */
    @Response<void>(201, '2-fatore code sent')
    @Response<LocalServerInfo[]>(210, 'select local server to connect to')
    @Response<ErrorResponse>(501, 'Server error')
    @Response<ErrorResponse>(403, 'Auth fail')
    @Response<ErrorResponse>(422, 'Invalid schema')
    @Post('login')
    public async loginDocumentation(@Request() request: express.Request, @Body() login: LoginLocalServer):
        Promise<void | LocalServerInfo[]> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }

    /**
     * 2-step verification login to local server via remote server channel.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Response<ErrorResponse>(403, 'Auth fail')
    @Response<ErrorResponse>(422, 'Invalid schema')
    @Post('login/tfa')
    public async loginTfaDocumentation(@Request() request: express.Request, @Body() login: LoginLocalServer): Promise<void> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }

    /**
     * Logout manually from remote and local server systems.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('logout')
    public async logoutDocumentation(): Promise<void> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
}
