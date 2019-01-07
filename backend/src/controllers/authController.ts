import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { AuthBlSingleton } from '../business-layer/authBl';
import { ErrorResponse, Login, LoginTfa, User } from '../models/sharedInterfaces';

/**
 * Because that express response object needs in auth logic (to write cookies)
 * The TSOA routing is for documentation only.
 * and one day i will extends TSOA lib to support response in parameter inject like request object.
 */
@Tags('Authentication')
@Route('auth')
export class AuthController extends Controller {

    /**
     * Login to system.
     */
    public async login(request: express.Request, response: express.Response, login: Login): Promise<void> {
        await AuthBlSingleton.login(response, login);
    }

    /**
     * 2-step verification login.
     */
    public async loginTfa(request: express.Request, response: express.Response, login: LoginTfa): Promise<void> {

        // TODO ...
        return;
    }

    /**
     * Logout manualy from system.
     */
    public async logout(request: express.Request, response: express.Response): Promise<void> {

        // TODO ...
        return;
    }

    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////

    /**
     * Login.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Response<ErrorResponse>(403, 'Auth fail')
    @Response<ErrorResponse>(422, 'Invalid schema')
    @Post('login')
    public async loginDocumentation(@Request() request: express.Request, @Body() login: Login): Promise<void> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }

    /**
     * 2-step verification login.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Response<ErrorResponse>(403, 'Auth fail')
    @Response<ErrorResponse>(422, 'Invalid schema')
    @Post('login/tfa')
    public async loginTfaDocumentation(@Request() request: express.Request, @Body() login: LoginTfa): Promise<void> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }

    /**
     * Logout manualy from system.
     */
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('logout')
    public async logoutDocumentation(): Promise<void> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
}
