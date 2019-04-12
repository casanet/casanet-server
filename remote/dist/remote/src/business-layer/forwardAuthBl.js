"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../../backend/src/config");
const channelsBl_1 = require("../business-layer/channelsBl");
const localServersBl_1 = require("../business-layer/localServersBl");
const forwardUserSessionsBl_1 = require("./forwardUserSessionsBl");
class ForwardAuthBl {
    /**
     *
     * @param channelsBl channel bl injection.
     * @param localServersBl local servers bl injection
     * @param forwardUsersSessionsBl forwardUsersSession bl injection
     */
    constructor(channelsBl, localServersBl, forwardUsersSessionsBl) {
        this.channelsBl = channelsBl;
        this.localServersBl = localServersBl;
        this.forwardUsersSessionsBl = forwardUsersSessionsBl;
        this.GENERIC_ERROR_RESPONSE = {
            responseCode: 2403,
            message: 'username password or local server is incorrect',
        };
    }
    /**
     * Active session of request. call it when auth check success.
     * @param response express response to load with session key.
     * @param localServerId local server of authed user.
     * @param httpResponse http response message from local server. with session key.
     */
    async activeSession(response, localServerId, httpResponse) {
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
            httpOnly: true,
            secure: config_1.Configuration.http.useHttps,
            maxAge: httpResponse.httpSession.maxAge * 1000,
        });
    }
    /**
     * Forward login request to local server. and save session if success.
     */
    async login(request, response, login) {
        /** local server id to try login to. */
        let connectLocalServerId;
        /** If user know local server id, use it. */
        if (login.localServerId) {
            connectLocalServerId = login.localServerId;
        }
        else {
            /** Get all local server that user is mention as valid users */
            const userLocalServersInfo = await this.localServersBl.getLocalServerInfoByUser(login.email);
            /** If there is not any local server that user is mantion in it. throw it out.  */
            if (userLocalServersInfo.length === 0) {
                throw this.GENERIC_ERROR_RESPONSE;
            }
            else if (userLocalServersInfo.length === 1) {
                /** If user is mention in one local server, use it and continue. */
                connectLocalServerId = userLocalServersInfo[0].localServerId;
            }
            else {
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
                        httpBody: { email: login.email, password: login.password },
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
                response.statusCode = 403;
                return this.GENERIC_ERROR_RESPONSE;
            }
        }
        /** Send login HTTP request over WS to local server, and wait for the answer. */
        const localResponse = await this.channelsBl.sendHttpViaChannels(connectLocalServerId, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: { email: login.email, password: login.password },
            httpSession: '',
        });
        /** If local server auth this user success. active login in remote too. */
        if (localResponse.httpStatus === 200 && localResponse.httpSession) {
            await this.activeSession(response, connectLocalServerId, localResponse);
            return;
        }
        /** If request fail becuase that local server not conected,
         * hide this info from user, case attaker want to know if username valid.
         */
        if (localResponse.httpStatus === 501 && localResponse.httpBody && localResponse.httpBody.responseCode === 4501) {
            throw this.GENERIC_ERROR_RESPONSE;
        }
        /** Any other case, send local server response as is to client. */
        response.statusCode = localResponse.httpStatus;
        return localResponse.httpBody;
    }
    /**
     * Forward login tfa request to local server. and save session if success.
     */
    async loginTfa(request, response, login) {
        /** See comments in login function, its almost same. */
        let connectLocalServerId;
        if (login.localServerId) {
            connectLocalServerId = login.localServerId;
        }
        else {
            const userLocalServersInfo = await this.localServersBl.getLocalServerInfoByUser(login.email);
            if (userLocalServersInfo.length === 0) {
                throw this.GENERIC_ERROR_RESPONSE;
            }
            else if (userLocalServersInfo.length === 1) {
                connectLocalServerId = userLocalServersInfo[0].localServerId;
            }
            else {
                /**
                 * If there is more then one local server, throw it.
                 * Client should know from last his login request if he needs to mention local server id or not.
                 */
                throw this.GENERIC_ERROR_RESPONSE;
            }
        }
        const localResponse = await this.channelsBl.sendHttpViaChannels(connectLocalServerId, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: { email: login.email, password: login.password },
            httpSession: '',
        });
        if (localResponse.httpStatus === 200 && localResponse.httpSession) {
            await this.activeSession(response, connectLocalServerId, localResponse);
            return;
        }
        /** If request fail becuase that local server not conected,
         * hide this info from user, case attaker want to know if username valid.
         */
        if (localResponse.httpStatus === 501 && localResponse.httpBody && localResponse.httpBody.responseCode === 4501) {
            throw this.GENERIC_ERROR_RESPONSE;
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
    async logout(request, response, forwardUserSession) {
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
exports.ForwardAuthBl = ForwardAuthBl;
exports.ForwardAuthBlSingleton = new ForwardAuthBl(channelsBl_1.ChannelsBlSingleton, localServersBl_1.LocalServersBlSingleton, forwardUserSessionsBl_1.ForwardUsersSessionsBlSingleton);
//# sourceMappingURL=forwardAuthBl.js.map