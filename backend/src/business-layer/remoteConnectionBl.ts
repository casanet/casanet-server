import * as chai from 'chai';
import chaiHttp = require('chai-http');
import * as express from 'express';
import { Express, Router } from 'express';
import moment = require('moment');
import { WebSocketClient } from 'reconnecting-ws';
import { RemoteConnectionDal } from '../data-layer/remoteConnectionDal';
import { RemoteConnectionDalSingleton } from '../data-layer/remoteConnectionDal';
import { HttpRequest, LocalMessage, RemoteMessage } from '../models/remote2localProtocol';
import { ErrorResponse, MinionFeed, RemoteConnectionStatus, RemoteSettings, TimingFeed } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { GetMachinMacAddress } from '../utilities/macAddress';
import { MinionsBl } from './minionsBl';
import { MinionsBlSingleton } from './minionsBl';
import { TimingsBl } from './timingsBl';
import { TimingsBlSingleton } from './timingsBl';
import { UsersBl } from './usersBl';
import { UsersBlSingleton } from './usersBl';

/**
 * Used to connect remote server via web socket, and let`s users acceess
 */
export class RemoteConnectionBl {

    /** Express router, used to create http requests from
     * remote server without actually open TCP connection.
     */
    private expressRouter: express.Express;

    /** Hold the remote connection status */
    private remoteConnectionStatus: RemoteConnectionStatus = 'cantReachRemoteServer';

    /** Web socket client object, to connect remote server  */
    private webSocketClient: WebSocketClient;

    /**
     * Init remote connection bl. using dependecy injection pattern to allow units testings.
     * @param remoteConnectionDal Inject the remote connection dal..
     * @param minionsBl Inject the minions bl instance to used minionsBl.
     * @param timingsBl Inject the timings bl instance to used timingsBl.
     * @param usersBl Inject the user bl instance to used userBl.
     */
    constructor(private remoteConnectionDal: RemoteConnectionDal,
                private minionsBl: MinionsBl,
                private timingsBl: TimingsBl,
                private usersBl: UsersBl,
    ) {
        /** Use chai testing lib, to mock http requests */
        chai.use(chaiHttp);

        /** Connect to remote server */
        this.connectToRemote();

        /** Subscribe to minions feed, to forward remote server */
        this.minionsBl.minionFeed.subscribe((minionFeed: MinionFeed) => {
            const localMessage: LocalMessage = {
                localMessagesType: 'feed',
                message: {
                    feed: {
                        feedType: 'minions',
                        feedContent: minionFeed,
                    },
                },
            };
            this.sendMessage(localMessage);
        });

        /** Subscribe to timings feed, to forward remote server */
        this.timingsBl.timingFeed.subscribe((timingFeed: TimingFeed) => {
            const localMessage: LocalMessage = {
                localMessagesType: 'feed',
                message: {
                    feed: {
                        feedType: 'timings',
                        feedContent: timingFeed,
                    },
                },
            };
            this.sendMessage(localMessage);
        });

        /** Start sending ack message interval */
        setInterval(() => {
            /** If status is not OK or Connection problem
             * dont send ack message.
             * (If remote server not set yet, ther is no point to try sending ack).
             */
            if (this.remoteConnectionStatus !== 'connectionOK' &&
                this.remoteConnectionStatus !== 'cantReachRemoteServer') {
                return;
            }
            this.sendMessage({
                localMessagesType: 'ack',
                message: {},
            });
        }, moment.duration(20, 'seconds').asMilliseconds());
    }

    /**
     * Let app give the express router instance.
     * Then each remote request will pass to app via router.
     * without actually opening TCP connection with HTTP request.
     * @param expressRouter The express app/router instance
     */
    public loadExpressRouter(expressRouter: express.Express) {
        this.expressRouter = expressRouter;
    }

    /** Get current remote connection status */
    public get connectionStatus(): RemoteConnectionStatus {
        return this.remoteConnectionStatus;
    }

    /** Get remote server host/ip name */
    public async getRemoteHost(): Promise<string> {
        const remoteSettings = await this.remoteConnectionDal.getRemoteSettings();
        if (!remoteSettings) {
            return '';
        }
        return remoteSettings.host;
    }

    /**
     * Set remote server settings.
     * then close old connection if exsit, and try open new connection with new settings.
     */
    public async setRemoteSettings(remoteSettings: RemoteSettings) {
        this.closeRemoteConnection();
        this.remoteConnectionStatus = 'notConfigured';
        await this.remoteConnectionDal.setRemoteSettings(remoteSettings);
        this.connectToRemote();
    }

    /**
     * Disconnect from remote server, and delete his settings.
     */
    public async removeRemoteSettings() {
        this.closeRemoteConnection();
        this.remoteConnectionStatus = 'notConfigured';
        await this.remoteConnectionDal.deleteRemoteSettings();
    }

    private sendMessage(localMessage: LocalMessage) {
        if (this.remoteConnectionStatus !== 'connectionOK') {
            return;
        }
        try { this.webSocketClient.sendData(JSON.stringify(localMessage)); } catch (error) { }
    }

    /** Close manualy web socket to remote server */
    private closeRemoteConnection() {
        try { this.webSocketClient.disconnect(); } catch (error) { }
    }

    /** Connect to remote server by web sockets */
    private async connectToRemote() {
        /** Get remote server settings */
        const remoteSettings = await this.remoteConnectionDal.getRemoteSettings();

        /** If there is not settings */
        if (!remoteSettings) {
            this.remoteConnectionStatus = 'notConfigured';
            logger.debug('There is no connection configuration to remote server.');
            return;
        }

        /** create web socket instance */
        this.webSocketClient = new WebSocketClient(3000, false);

        /** Allow *only wss* connections. */
        /** open connection to remote server. */
        this.webSocketClient.connect(`${remoteSettings.host}`);

        logger.info(`Opening ws channel to ${remoteSettings.host}`);

        this.webSocketClient.on('open', () => {
            this.remoteConnectionStatus = 'connectionOK';
            logger.info(`Ws channel to ${remoteSettings.host} opend succssfuly`);
        });

        this.webSocketClient.on('message', async (rawRemoteMessage: string) => {

            /** Parse message and send to correct method handle */
            const remoteMessage: RemoteMessage = JSON.parse(rawRemoteMessage);
            switch (remoteMessage.remoteMessagesType) {
                case 'readyToInitialization': await this.onInitReady(); break;
                case 'authenticationFail': await this.onAuthenticationFail(remoteMessage.message[remoteMessage.remoteMessagesType]); break;
                case 'authenticatedSuccessfuly': await this.onAuthenticatedSuccessfuly(); break;
                case 'localUsers': await this.onUsersRequired(remoteMessage.message[remoteMessage.remoteMessagesType]); break;
                case 'ackOk': await this.OnArkOk(); break;
                case 'httpRequest': await this.onRemoteHttpRequest(remoteMessage.message[remoteMessage.remoteMessagesType]); break;
            }
        });

        this.webSocketClient.on('error', (err: Error) => {
            logger.info(`Ws channel error ${err.message}`);
        });

        this.webSocketClient.on('close', (code: number, reason: string) => {
            if (this.remoteConnectionStatus !== 'connectionOK') {
                return;
            }
            this.remoteConnectionStatus = 'cantReachRemoteServer';
            logger.info(`Ws channel closed ${remoteSettings.host} code: ${code} reasone: ${reason}`);
        });

        this.webSocketClient.on('reconnect', () => {
            logger.debug(`Ws channel trying reconnect ${remoteSettings.host}`);
        });
    }

    private async OnArkOk() {
        this.remoteConnectionStatus = 'connectionOK';
    }

    /** If remote server needs collection of users in local server, sent it */
    private async onUsersRequired(usersRequest: { requestId: string; }) {
        try {
            const users = await this.usersBl.getUsers();
            const usersEmail = users.map((user) => user.email);

            this.sendMessage({
                localMessagesType: 'localUsers',
                message: {
                    localUsers: {
                        requestId: usersRequest.requestId,
                        users: usersEmail,
                    },
                },
            });

        } catch (error) {

        }
    }

    /** Handle auth passed messages from remote server */
    private async onAuthenticatedSuccessfuly() {
        this.remoteConnectionStatus = 'connectionOK';
        logger.info(`Successfuly authenticated to remote server.`);
    }

    /**
     * Handle auth fail message from remote server.
     * @param errorResponse Error message from remote server.
     */
    private async onAuthenticationFail(errorResponse: ErrorResponse) {
        logger.error(`Authenticate local server in remote server fail, ${errorResponse.message}`);
        this.closeRemoteConnection();
        this.remoteConnectionStatus = 'authorizationFail';
    }

    /**
     * On remote server ready to local authentication request.
     */
    private async onInitReady() {
        try {
            const machineAddress = await GetMachinMacAddress();
            const remoteSettings = await this.remoteConnectionDal.getRemoteSettings();

            if (!remoteSettings) {
                logger.error(`There is no way to connect remote server, remote settings data not exist`);
                this.closeRemoteConnection();
                this.remoteConnectionStatus = 'notConfigured';
                return;
            }

            this.sendMessage({
                localMessagesType: 'initialization',
                message: {
                    initialization: {
                        macAddress: machineAddress,
                        remoteAuthKey: remoteSettings.connectionKey,
                    },
                },
            });

        } catch (error) {
            logger.error(`There is no way to connect remote server, fail to get mac address ${error}`);
            this.closeRemoteConnection();
        }
    }

    /** Handle http request from remote server */
    private async onRemoteHttpRequest(httpRequest: HttpRequest) {

        /** If express router not load yet, ignore */
        if (!this.expressRouter) {
            return;
        }

        /** create request agent mock */
        const requestAgent = chai.request(this.expressRouter);
        /** generate request */
        let request = requestAgent.get('/');
        /** generate correct request method */
        switch (httpRequest.httpMethod) {
            case 'GET': request = requestAgent.get(httpRequest.httpPath); break;
            case 'POST': request = requestAgent.post(httpRequest.httpPath); break;
            case 'PUT': request = requestAgent.put(httpRequest.httpPath); break;
            case 'DELETE': request = requestAgent.del(httpRequest.httpPath); break;
        }
        /** set cookie header */
        request.set('Cookie', `session=${httpRequest.httpSession}`);
        /** send request and wait for response */
        const response = await request.send(httpRequest.httpBody);
        /** send response back to remote server */
        this.sendMessage({
            localMessagesType: 'httpResponse',
            message: {
                httpResponse: {
                    requestId: httpRequest.requestId,
                    httpStatus: response.status,
                    httpBody: response.body,
                    httpSession: this.extractCookie(response.header),
                },
            },
        });
    }

    /** Extract http cookie from http headers response  */
    private extractCookie(headers: {}): { key: string; maxAge: number; } {
        try {
            if (!headers['set-cookie']) {
                return;
            }
            const sessionParts = headers['set-cookie'][0].split(';');
            return {
                key: sessionParts[0].split('=')[1],
                maxAge: parseInt(sessionParts[1].split('=')[1], 10),
            };
        } catch (error) { return; }
    }
}

export const RemoteConnectionBlSingleton = new RemoteConnectionBl(RemoteConnectionDalSingleton,
    MinionsBlSingleton,
    TimingsBlSingleton,
    UsersBlSingleton);
