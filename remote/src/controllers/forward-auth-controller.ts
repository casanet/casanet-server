import * as express from 'express';
import * as cryptoJs from 'crypto-js';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse, User, Login } from '../../../backend/src/models/sharedInterfaces';
import { ChannelsSingleton } from '../logic';
import { getServersByForwardUser, getServer } from '../data-access';
import { LocalServerInfo, LoginLocalServer, ForwardSession } from '../models';
import { Configuration } from '../../../backend/src/config';
import { HttpResponse } from '../../../backend/src/models/remote2localProtocol';
import { RequestSchemaValidator, SchemaValidator } from '../../../backend/src/security/schemaValidator';
import { LoginSchema } from '../security/schemaValidator';
import { forwardCache, jwtSecret } from '../security/authentication';
import * as jwt from 'jsonwebtoken';

const jwtExpiresIn = process.env.FORWARD_JWT_EXPIRES_IN || '360 days';

/**
 * Manage local servers login requests forwarding
 */
@Tags('Authentication')
@Route('auth')
export class ForwardAuthController extends Controller {

    private async activeSession(localServerMacAddress: string, localUser: string, httpResponse: HttpResponse) {
        /** Never save plain text key. */
        const forwardSession: ForwardSession = {
            session: httpResponse.httpSession.key,
            localUser,
            server: localServerMacAddress,
        }

        const token = jwt.sign(
            forwardSession,
            jwtSecret,
            { expiresIn: jwtExpiresIn }
        );
        this.setHeader('Set-Cookie', `session=${token}; Max-Age=${httpResponse.httpSession.maxAge}; Path=/; HttpOnly; ${Configuration.http.useHttps ? 'Secure' : ''} SameSite=Strict`);
        // TODO change to 204, after frontend update
        this.setStatus(200);
    }

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
    public async login(@Request() request: express.Request, @Body() login: LoginLocalServer):
        Promise<void | LocalServerInfo[]> {
        try {
            login = await SchemaValidator(login, LoginSchema);
        } catch (err) {
            this.setStatus(422);
            return err.error.message;
        }

        /** local server id to try login to. */
        let connectLocalServerId: string;

        /** If user know local server id, use it. */
        if (login.localServerId) {
            connectLocalServerId = login.localServerId;
        } else {
            /** Get all local server that user is mention as valid users */
            const userLocalServersInfo = await getServersByForwardUser(login.email);
            /** If there is not any local server that user is mantion in it. throw it out.  */
            if (userLocalServersInfo.length === 0) {
                this.setStatus(401);
                return;
            } else if (userLocalServersInfo.length === 1) {
                /** If user is mention in one local server, use it and continue. */
                connectLocalServerId = userLocalServersInfo[0].macAddress;
            } else {
                /**
                 * If user mention in more then one local server
                 * send him back array of his local servers to select local server in login.
                 */

                /**
                 * Just before sending this information,
                 * make sure that least one of local server authenticate request username + password.
                 */
                for (const userLocalServerInfo of userLocalServersInfo) {
                    /** Send login HTTP request over WS to local server, and wait for the answer. */
                    const localLoginCheckResponse = await ChannelsSingleton.sendHttpViaChannels(userLocalServerInfo.macAddress, {
                        requestId: undefined,
                        httpPath: request.path,
                        httpMethod: request.method.toUpperCase(),
                        httpBody: { email: login.email, password: login.password } as Login,
                        httpSession: '',
                    });

                    /** If the local server authenticate request certificate let client select whitch local server he wants to connect */
                    if (localLoginCheckResponse.httpStatus === 200 || localLoginCheckResponse.httpStatus === 204) {
                        /** Mark 210 http status code. */
                        this.setStatus(210);
                        return userLocalServersInfo.map((server): LocalServerInfo => {
                            return {
                                displayName: server.displayName,
                                localServerId: server.macAddress,
                            }
                        });
                    }
                }

                /** If non of local servers succfully auth, dont tell attaker info about servers */
                this.setStatus(401);
                return;
            }
        }

        /** Send login HTTP request over WS to local server, and wait for the answer. */
        const localResponse = await ChannelsSingleton.sendHttpViaChannels(connectLocalServerId, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: { email: login.email, password: login.password } as Login,
            httpSession: '',
        });

        /** If local server auth this user success. active login in remote too. */
        if (localResponse.httpStatus === 200 && localResponse.httpSession) {
            return await this.activeSession(connectLocalServerId, login.email, localResponse);
        }

        /** If request fail becuase that local server not conected,
         * hide this info from user, case attaker want to know if username valid.
         */
        if (localResponse.httpStatus === 501 && localResponse.httpBody && localResponse.httpBody.responseCode === 4501) {
            this.setStatus(401);
            return;
        }

        /** Any other case, send local server response as is to client. */
        this.setStatus(localResponse.httpStatus);
        return localResponse.httpBody;
    }

    /**
     * 2-step verification login to local server via remote server channel.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Response<ErrorResponse>(403, 'Auth fail')
    @Response<ErrorResponse>(422, 'Invalid schema')
    @Post('login/tfa')
    public async loginTfa(@Request() request: express.Request, @Body() login: LoginLocalServer): Promise<void> {
        /** See comments in login function, its almost same. */

        try {
            login = await SchemaValidator(login, LoginSchema);
        } catch (err) {
            this.setStatus(422);
            return err.error.message;
        }

        let connectLocalServerId: string;

        if (login.localServerId) {
            connectLocalServerId = login.localServerId;
        } else {
            const userLocalServersInfo = await await getServersByForwardUser(login.email);
            if (userLocalServersInfo.length === 0) {
                this.setStatus(401);
                return;
            } else if (userLocalServersInfo.length === 1) {
                connectLocalServerId = userLocalServersInfo[0].macAddress;
            } else {
                /**
                 * If there is more then one local server, throw it.
                 * Client should know from last his login request if he needs to mention local server id or not.
                 */
                this.setStatus(401);
                return;
            }
        }

        const localResponse = await ChannelsSingleton.sendHttpViaChannels(connectLocalServerId, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: { email: login.email, password: login.password } as Login,
            httpSession: '',
        });

        if (localResponse.httpStatus === 200 && localResponse.httpSession) {
            return await this.activeSession(connectLocalServerId, login.email, localResponse);
        }

        /** If request fail becuase that local server not conected,
         * hide this info from user, case attaker want to know if username valid.
         */
        if (localResponse.httpStatus === 501 && localResponse.httpBody && localResponse.httpBody.responseCode === 4501) {
            this.setStatus(401);
            return;
        }

        this.setStatus(localResponse.httpStatus);
        return localResponse.httpBody;
    }

    /**
     * Logout manually from remote and local server systems.
     */
    @Security('forwardAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('logout')
    public async logout(@Request() request: express.Request): Promise<void> {
        // TODO: extract cookie.
        const forwardSession: ForwardSession = request.body;
        /** Send logut request to local server via sw channel */
        await ChannelsSingleton.sendHttpViaChannels(forwardSession.server, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: request.body,
            httpSession: forwardSession.session,
        });

        // TODO: add to tokens black list
        /** Send clean session by response to client browser token. */
        this.setHeader('Set-Cookie', `session=0;`);
    }
}
