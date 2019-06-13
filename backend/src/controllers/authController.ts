import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { AuthBlSingleton } from '../business-layer/authBl';
import { SessionsBlSingleton } from '../business-layer/sessionsBl';
import { UsersBlSingleton } from '../business-layer/usersBl';
import { ErrorResponse, Login, User } from '../models/sharedInterfaces';

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
    public async login(request: express.Request, response: express.Response, login: Login): Promise<ErrorResponse> {
        return await AuthBlSingleton.login(response, login);
    }

    /**
     * 2-step verification login.
     */
    public async loginTfa(request: express.Request, response: express.Response, login: Login): Promise<ErrorResponse> {
        return await AuthBlSingleton.loginTfa(response, login);
    }

    /**
     * LLogout manually from the system.
     */
    public async logout(request: express.Request, response: express.Response): Promise<void> {
        await AuthBlSingleton.logout(request.cookies.session, response);
    }

    /**
     * Logout from all activate sessions.
     */
    @Security('adminAuth')
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('/logout-sessions/{userId}')
    public async logoutSessions(userId: string, @Request() request: express.Request): Promise<void> {
        const userSession = request.user as User;
        /**
         * Only admin can update other user.
         */
        if (userSession.scope !== 'adminAuth' && userSession.email !== userId) {
            throw {
                responseCode: 4403,
                message: 'user not allowed to logout for other users',
            } as ErrorResponse;
        }
        
        const user = await UsersBlSingleton.getUser(userId);
        await SessionsBlSingleton.deleteUserSessions(user);
    }

    //////////////////////////////////////////////////
    /////// SWAGGER DOCUMENTATION ONLY METHODS ///////
    //////////////////////////////////////////////////

    /**
     * Login.
     */
    @Response<void>(201, '2-fatore code sent')
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
    public async loginTfaDocumentation(@Request() request: express.Request, @Body() login: Login): Promise<void> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }

    /**
     * Logout manually from the system.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('logout')
    public async logoutDocumentation(): Promise<void> {
        throw new Error('Request never should be here. it is a documentation only route.');
    }
}
