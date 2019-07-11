"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const jwt = require("jsonwebtoken");
const tsoa_1 = require("tsoa");
const config_1 = require("../../../backend/src/config");
const schemaValidator_1 = require("../../../backend/src/security/schemaValidator");
const data_access_1 = require("../data-access");
const logic_1 = require("../logic");
const authentication_1 = require("../security/authentication");
const schemaValidator_2 = require("../security/schemaValidator");
const jwtExpiresIn = process.env.FORWARD_JWT_EXPIRES_IN || '360 days';
/**
 * Manage local servers login requests forwarding
 */
let ForwardAuthController = class ForwardAuthController extends tsoa_1.Controller {
    async activeSession(localServerMacAddress, localUser, httpResponse) {
        /** Never save plain text key. */
        const forwardSession = {
            session: httpResponse.httpSession.key,
            localUser,
            server: localServerMacAddress,
        };
        const token = jwt.sign(forwardSession, authentication_1.jwtSecret, { expiresIn: jwtExpiresIn });
        // tslint:disable-next-line:max-line-length
        this.setHeader('Set-Cookie', `session=${token}; Max-Age=${httpResponse.httpSession.maxAge}; Path=/; HttpOnly; ${config_1.Configuration.http.useHttps ? 'Secure' : ''} SameSite=Strict`);
        // TODO change to 204, after frontend update
        this.setStatus(200);
    }
    /**
     * Login to local server via remote server channel.
     * If users exists in more then one local server, it returns status code 210 and the available user servers to select.
     */
    async login(request, login) {
        try {
            login = await schemaValidator_1.SchemaValidator(login, schemaValidator_2.LoginSchema);
        }
        catch (err) {
            this.setStatus(422);
            return err.error.message;
        }
        /** local server id to try login to. */
        let connectLocalServerId;
        /** If user know local server id, use it. */
        if (login.localServerId) {
            connectLocalServerId = login.localServerId;
        }
        else {
            /** Get all local server that user is mention as valid users */
            const userLocalServersInfo = await data_access_1.getServersByForwardUser(login.email);
            /** If there is not any local server that user is mantion in it. throw it out.  */
            if (userLocalServersInfo.length === 0) {
                this.setStatus(401);
                return;
            }
            else if (userLocalServersInfo.length === 1) {
                /** If user is mention in one local server, use it and continue. */
                connectLocalServerId = userLocalServersInfo[0].macAddress;
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
                    const localLoginCheckResponse = await logic_1.ChannelsSingleton.sendHttpViaChannels(userLocalServerInfo.macAddress, {
                        requestId: undefined,
                        httpPath: request.path,
                        httpMethod: request.method.toUpperCase(),
                        httpBody: { email: login.email, password: login.password },
                        httpSession: '',
                    });
                    /** If the local server authenticate request certificate let client select whitch local server he wants to connect */
                    if (localLoginCheckResponse.httpStatus === 200 || localLoginCheckResponse.httpStatus === 204) {
                        /** Mark 210 http status code. */
                        this.setStatus(210);
                        return userLocalServersInfo.map((server) => {
                            return {
                                displayName: server.displayName,
                                localServerId: server.macAddress,
                            };
                        });
                    }
                }
                /** If non of local servers succfully auth, dont tell attaker info about servers */
                this.setStatus(401);
                return;
            }
        }
        /** Send login HTTP request over WS to local server, and wait for the answer. */
        const localResponse = await logic_1.ChannelsSingleton.sendHttpViaChannels(connectLocalServerId, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: { email: login.email, password: login.password },
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
    async loginTfa(request, login) {
        /** See comments in login function, its almost same. */
        try {
            login = await schemaValidator_1.SchemaValidator(login, schemaValidator_2.LoginSchema);
        }
        catch (err) {
            this.setStatus(422);
            return err.error.message;
        }
        let connectLocalServerId;
        if (login.localServerId) {
            connectLocalServerId = login.localServerId;
        }
        else {
            const userLocalServersInfo = await await data_access_1.getServersByForwardUser(login.email);
            if (userLocalServersInfo.length === 0) {
                this.setStatus(401);
                return;
            }
            else if (userLocalServersInfo.length === 1) {
                connectLocalServerId = userLocalServersInfo[0].macAddress;
            }
            else {
                /**
                 * If there is more then one local server, throw it.
                 * Client should know from last his login request if he needs to mention local server id or not.
                 */
                this.setStatus(401);
                return;
            }
        }
        const localResponse = await logic_1.ChannelsSingleton.sendHttpViaChannels(connectLocalServerId, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: { email: login.email, password: login.password },
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
    async logout(request) {
        const forwardSession = request.user;
        /** Send logout request to local server via sw channel */
        await logic_1.ChannelsSingleton.sendHttpViaChannels(forwardSession.server, {
            requestId: undefined,
            httpPath: request.path,
            httpMethod: request.method.toUpperCase(),
            httpBody: request.body,
            httpSession: forwardSession.session,
        });
        // TODO: add to tokens black list
        /** Send clean session by response to client browser token. */
        // tslint:disable-next-line:max-line-length
        this.setHeader('Set-Cookie', `session=null; Max-Age=${1}; Path=/; HttpOnly; ${config_1.Configuration.http.useHttps ? 'Secure' : ''} SameSite=Strict`);
    }
};
__decorate([
    tsoa_1.Response(201, '2-fatore code sent'),
    tsoa_1.Response(210, 'select local server to connect to'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Response(403, 'Auth fail'),
    tsoa_1.Response(422, 'Invalid schema'),
    tsoa_1.Post('login'),
    __param(0, tsoa_1.Request()), __param(1, tsoa_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ForwardAuthController.prototype, "login", null);
__decorate([
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Response(403, 'Auth fail'),
    tsoa_1.Response(422, 'Invalid schema'),
    tsoa_1.Post('login/tfa'),
    __param(0, tsoa_1.Request()), __param(1, tsoa_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ForwardAuthController.prototype, "loginTfa", null);
__decorate([
    tsoa_1.Security('forwardAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('logout'),
    __param(0, tsoa_1.Request()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ForwardAuthController.prototype, "logout", null);
ForwardAuthController = __decorate([
    tsoa_1.Tags('Authentication'),
    tsoa_1.Route('auth')
], ForwardAuthController);
exports.ForwardAuthController = ForwardAuthController;
//# sourceMappingURL=forward-auth-controller.js.map