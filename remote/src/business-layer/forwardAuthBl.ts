import * as express from 'express';
import { Configuration } from '../../../backend/src/config';
import { HttpResponse } from '../../../backend/src/models/remote2localProtocol';
import { ErrorResponse, Login } from '../../../backend/src/models/sharedInterfaces';
import { logger } from '../../../backend/src/utilities/logger';
import { ChannelsBl, ChannelsBlSingleton } from '../business-layer/channelsBl';
import { LocalServersBl, LocalServersBlSingleton } from '../business-layer/localServersBl';
import { ForwardUserSession } from '../models/remoteInterfaces';
import { LoginLocalServer } from '../models/sharedInterfaces';
import { ForwardUsersSessionsBl, ForwardUsersSessionsBlSingleton } from './forwardUserSessionsBl';

export class ForwardAuthBl {

    /**
     *
     * @param channelsBl channel bl injection.
     * @param localServersBl local servers bl injection
     * @param forwardUsersSessionsBl forwardUsersSession bl injection
     */
    constructor(private channelsBl: ChannelsBl,
                private localServersBl: LocalServersBl,
                private forwardUsersSessionsBl: ForwardUsersSessionsBl) {

    }

    /**
     * Active session of request. call it when auth check success.
     * @param response express response to load with session key.
     * @param localServerId local server of authed user.
     * @param httpResponse http response message from local server. with session key.
     */
    private async activeSession(response: express.Response, localServerId: string, httpResponse: HttpResponse): Promise<void> {

        /**
         * Save session,
         * used when user sending request to local server,so can check session *befor* sending.
         */
        await this.forwardUsersSessionsBl.createNewSession(localServerId, httpResponse.httpSession.key);

        /**
         * Finally load session on cookies response.
         */
        response.cookie('session', httpResponse.httpSession.key, {
            sameSite: true,
            httpOnly: true, // minimize risk of XSS attacks by restricting the client from reading the cookie
            secure: Configuration.http.useHttps, // only send cookie over https
            maxAge: httpResponse.httpSession.maxAge * 1000, // max age as miliseconds
        });
    }

    /**
     * Forward login request to local server. and save session if success.
     */
    public async login(request: express.Request, response: express.Response, login: LoginLocalServer): Promise<any> {

        /** Use only generic error response */
        const errorResponse: ErrorResponse = {
            responseCode: 2403,
            message: 'user name or password incorrent',
        };

        /** local server id to try login to. */
        let connectLocalServerId: string;

        /** If user know local server id, use it. */
        if (login.localServerId) {
            connectLocalServerId = login.localServerId;
        } else {
            /** Get all local server that user is mention as valid users */
            const userLocalServersInfo = await this.localServersBl.getLocalServerInfoByUser(login.email);
            /** If there is not any local server that user is mantion in it. throw it out.  */
            if (userLocalServersInfo.length === 0) {
                throw errorResponse;
            } else if (userLocalServersInfo.length === 1) {
                /** If user is mention in one local server, use it and continue. */
                connectLocalServerId = userLocalServersInfo[0].localServerId;
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
                    const localLoginCheckResponse = await this.channelsBl.sendHttpViaChannels(userLocalServerInfo.localServerId, {
                        requestId: undefined,
                        httpPath: request.path,
                        httpMethod: request.method.toUpperCase(),
                        httpBody: { email: login.email, password: login.password } as Login,
                        httpSession: '',
                    });

                    /** If the local server authenticate request certificate let client select whitch local server he wants to connect */
                    if (localLoginCheckResponse.httpStatus === 200 || localLoginCheckResponse.httpStatus === 201) {
                        /** Mark 210 http status code. */
                        response.statusCode = 210;
                        response.send(userLocalServersInfo);
                        return;
                    }
                }

                /** If non of local servers auth login cert, just return generic message */
                throw errorResponse;
            }
        }

        /** Send login HTTP request over WS to local server, and wait for the answer. */
        const localResponse = await this.channelsBl.sendHttpViaChannels(connectLocalServerId, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: { email: login.email, password: login.password } as Login,
            httpSession: '',
        });

        /** If local server auth this user success. active login in remote too. */
        if (localResponse.httpStatus === 200 && localResponse.httpSession) {
            await this.activeSession(response, connectLocalServerId, localResponse);
            return;
        }

        /** Any other case, send local server response as is to client. */
        response.statusCode = localResponse.httpStatus;
        return localResponse.httpBody;
    }

    /**
     * Forward login tfa request to local server. and save session if success.
     */
    public async loginTfa(request: express.Request, response: express.Response, login: LoginLocalServer): Promise<any> {
        /** See comments in login function, its almost same. */
        const errorResponse: ErrorResponse = {
            responseCode: 2403,
            message: 'user name or password incorrent',
        };

        let connectLocalServerId: string;

        if (login.localServerId) {
            connectLocalServerId = login.localServerId;
        } else {
            const userLocalServersInfo = await this.localServersBl.getLocalServerInfoByUser(login.email);
            if (userLocalServersInfo.length === 0) {
                throw errorResponse;
            } else if (userLocalServersInfo.length === 1) {
                connectLocalServerId = userLocalServersInfo[0].localServerId;
            } else {
                /**
                 * If there is more then one local server, throw it. user should know local server id.
                 * from login request.
                 */
                throw {
                    responseCode: 6404,
                    message: 'local server not exist',
                } as ErrorResponse;
            }
        }

        const localResponse = await this.channelsBl.sendHttpViaChannels(connectLocalServerId, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: { email: login.email, password: login.password } as Login,
            httpSession: '',
        });

        if (localResponse.httpStatus === 200 && localResponse.httpSession) {
            await this.activeSession(response, connectLocalServerId, localResponse);
            return;
        }

        response.statusCode = localResponse.httpStatus;
        return localResponse.httpBody;
    }

    /**
     * Logout from local server. and from remote server session cache.
     * @param request express requesrt.
     * @param response express response
     * @param forwardUserSession user forward session.
     */
    public async logout(request: express.Request, response: express.Response, forwardUserSession: ForwardUserSession): Promise<void> {
        /** Send logut request to local server via sw channel */
        const localResponse = await this.channelsBl.sendHttpViaChannels(forwardUserSession.localServerId, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: request.body,
            httpSession: '',
        });

        /** And in any case remove session from remote server cache. */
        await this.forwardUsersSessionsBl.deleteSession(forwardUserSession);

        /** Send clean session by response to client browser. */
        response.cookie('session', '');
    }
}

export const ForwardAuthBlSingleton = new ForwardAuthBl(ChannelsBlSingleton, LocalServersBlSingleton, ForwardUsersSessionsBlSingleton);
