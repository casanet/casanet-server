import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { AuthBlSingleton } from '../../../backend/src/business-layer/authBl';
import { ErrorResponse, Login, User } from '../../../backend/src/models/sharedInterfaces';

/**
 * Because that express response object needs in auth logic (to write cookies)
 * The TSOA routing is for documentation only.
 * and one day i will extends TSOA lib to support response in parameter inject like request object.
 */
@Tags('Administration')
@Route('/administration/auth')
export class AdministrationAuthController extends Controller {

    /**
     * Login to remote administration system.
     */
    public async login(request: express.Request, response: express.Response, login: Login): Promise<void> {
        await AuthBlSingleton.login(response, login);
    }

    /**
     * 2-step verification login to remote administration.
     */
    public async loginTfa(request: express.Request, response: express.Response, login: Login): Promise<void> {
        await AuthBlSingleton.loginTfa(response, login);
    }

    /**
     * Logout manualy from system.
     */
    public async logout(request: express.Request, response: express.Response): Promise<void> {
        await AuthBlSingleton.logout(request.cookies.session, response);
    }

    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////

    /**
     * Login to remote administration system.
     */
    @Response<void>(201, '2-fatore code sent')
    @Response<ErrorResponse>(501, 'Server error')
    @Response<ErrorResponse>(403, 'Auth fail')
    @Response<ErrorResponse>(422, 'Invalid schema')
    @Post('login')
    public async administrationLoginDocumentation(@Request() request: express.Request, @Body() login: Login): Promise<void> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }

    /**
     * 2-step verification login to remote administration.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Response<ErrorResponse>(403, 'Auth fail')
    @Response<ErrorResponse>(422, 'Invalid schema')
    @Post('login/tfa')
    public async administrationLoginTfaDocumentation(@Request() request: express.Request, @Body() login: Login): Promise<void> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }

    /**
     * Logout manualy from administration system.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('logout')
    public async administrationLogoutDocumentation(): Promise<void> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
}
