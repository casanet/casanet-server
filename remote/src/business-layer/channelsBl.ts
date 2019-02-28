import * as cryptoJs from 'crypto-js';
import { promises } from 'fs';
import { Moment } from 'moment';
import * as moment from 'moment';
import * as randomstring from 'randomstring';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import * as ws from 'ws';
import { HttpRequest, HttpResponse, LocalMessage, LocalServerFeed, RemoteMessage } from '../../../backend/src/models/remote2localProtocol';
import { ErrorResponse, MinionFeed, TimingFeed } from '../../../backend/src/models/sharedInterfaces';
import { logger } from '../../../backend/src/utilities/logger';
import { LocalServer } from '../models/sharedInterfaces';
import { LocalServersBl, LocalServersBlSingleton } from './localServersBl';
import { LocalServersSessionBlSingleton, LocalServersSessionsBl } from './localServersSessionsBl';

/**
 * Extend ws to allow hold uniqe id to each authenticated local server ws channel.
 * This id allow to route user requests to correct local server.
 */
export interface CasaWs extends ws {
    /**
     * uniqe identity each local servers.
     * (Don`t use local server id, becuase local server dont know it.)
     */
    machineMac: string;
}

/**
 * Manage all local servers ws I/O messages.
 * The main goal is to allow used ws protocol as req/res architecture.
 * So when user send HTTP request it will forward to local server via ws and
 * returns response, evan thet ws is messages architecture based.
 */
export class ChannelsBl {

    /**
     * Timeout for any http request.
     * (it long time bacuse of scaning network request that takes a while.)
     */
    private httpRequestTimeout: moment.Duration = moment.duration(1, 'minutes');
    /** Timeout for getting local server users collection. */
    private usersRequestTimeout: moment.Duration = moment.duration(10, 'seconds');

    /** Map all local servers ws channel by local server mac address */
    private localChannelsMap: { [key: string]: CasaWs } = {};

    /**
     * Hold each request promise reject/resolve methods.
     * until message will arrive from local server with response for current request.
     */
    private sentHttpRequestsMap: {
        [key: string]: {
            timeStamped: Date,
            forwardPromise: {
                resolve: (httpResponse: HttpResponse) => {},
                reject: (errorResponse: ErrorResponse) => {},
            },
        },
    } = {};
    /**
     * Hold each *localUsers* request promise reject/resolve methods.
     * until message will arrive from local server with response for current request.
     */
    private sentUsersRequestsMap: {
        [key: string]: {
            timeStamped: Date,
            forwardPromise: {
                resolve: (users: string[]) => {},
                reject: (errorResponse: ErrorResponse) => {},
            },
        },
    } = {};

    /** Feed of local servers feeds. */
    public localServersFeed = new BehaviorSubject<{ localServerId: string, localServerFeed: LocalServerFeed }>(undefined);

    /**
     * Init channels bl. using dependecy injection pattern to allow units testings.
     * @param localServersBl local servers bl injection.
     * @param localServersSessionsBl local server bl sessions injection.
     */
    constructor(private localServersBl: LocalServersBl, private localServersSessionsBl: LocalServersSessionsBl) {
        /** Invoke requests timeout activation. */
        this.setTimeoutRequestsActivation();
    }

    /**
     * Timeout of each request activation.
     * Used to clean up and send timeout response to requestes
     * that local server not answer to them.
     */
    private setTimeoutRequestsActivation() {
        setInterval(() => {
            const now = new Date();

            // Iterate all API requests.
            for (const [key, value] of Object.entries(this.sentHttpRequestsMap)) {
                if (now.getTime() - value.timeStamped.getTime() > this.httpRequestTimeout.asMilliseconds()) {
                    value.forwardPromise.reject({ responseCode: 5001, message: 'local server timeout' });
                    delete this.sentHttpRequestsMap[key];
                }
            }

            // Iterate all get users requests.
            for (const [key, value] of Object.entries(this.sentUsersRequestsMap)) {
                if (now.getTime() - value.timeStamped.getTime() > this.usersRequestTimeout.asMilliseconds()) {
                    value.forwardPromise.reject({ responseCode: 5001, message: 'local server timeout' });
                    delete this.sentUsersRequestsMap[key];
                }
            }

        }, moment.duration(10, 'seconds').asMilliseconds());
    }

    /**
     * Handle init request from local server, check if cert is OK.
     * @param wsChannel ws client object.
     * @param certAuth local server auth cert data
     */
    private async handleInitializationRequest(wsChannel: CasaWs, certAuth: { macAddress: string, remoteAuthKey: string }) {

        try {
            /** Get the local server based on cert mac address. */
            const localServer = await this.localServersBl.getlocalServersByMac(certAuth.macAddress);
            /** Get local server session based on local server id.  */
            const localServerSession = await this.localServersSessionsBl.getlocalServerSession(localServer.localServerId);

            /** Check if hash of local server cert key is same as session hash key  */
            if (cryptoJs.SHA256(certAuth.remoteAuthKey).toString() !== localServerSession.keyHash) {
                throw new Error('key not match');
            }

            /** If there is other channel from same local server */
            if (this.localChannelsMap[certAuth.macAddress]) {
                /** Remove authentication for any case.  */
                this.localChannelsMap[certAuth.macAddress].machineMac = null;

                /** Need to test the behavior of local server when closing old connection manualy  */
                // currentLocalChannel.close();

                delete this.localChannelsMap[certAuth.macAddress];
            }

            /**
             * Mark ws channel local server machine (mac) address.
             * used to auth and correct route in next messages.
             */
            wsChannel.machineMac = certAuth.macAddress;

            /** Hold the channel after auth seccess. */
            this.localChannelsMap[certAuth.macAddress] = wsChannel;

            /** Send local server authenticatedSuccessfuly message. */
            this.sendMessage(wsChannel, { remoteMessagesType: 'authenticatedSuccessfuly', message: {} });
        } catch (error) {
            /** send generic auth fail message */
            this.sendMessage(wsChannel, {
                remoteMessagesType: 'authenticationFail',
                message: {
                    authenticationFail: {
                        responseCode: 3403,
                        message: 'authorization of local server in remote, fail',
                    },
                },
            });

            /** wait a while until closing, to allow local server process fail message */
            setTimeout(() => {
                // try { wsChannel.close(); } catch (error) { }
            }, 4000);
        }
    }

    /**
     * Handle feed message arrived from local sercer.
     * @param wsChannel local server ws object that message arrived from.
     * @param localServerFeed feed data.
     */
    private async handleFeedUpdate(wsChannel: CasaWs, localServerFeed: LocalServerFeed) {

        try {
            /** Get local server based on local server mac */
            const localServer = await this.localServersBl.getlocalServersByMac(wsChannel.machineMac);
            /** Send feed */
            this.localServersFeed.next({ localServerId: localServer.localServerId, localServerFeed });
        } catch (error) {

        }
    }

    /**
     * Handle http response messages from local server.
     * @param httpResponse response data.
     */
    private handleHttpResponse(httpResponse: HttpResponse) {
        /** Get request promise methods */
        const sentRequest = this.sentHttpRequestsMap[httpResponse.requestId];

        /** If timeout activation delete it. there is nothing else to do. */
        if (!sentRequest) {
            /** Too late... */
            return;
        }

        /** Remove request promise from map */
        delete this.sentHttpRequestsMap[httpResponse.requestId];

        /** Activate promise resolve method with response as is. */
        sentRequest.forwardPromise.resolve(httpResponse);
    }

    /**
     * Handle local server users message arrived from local server.
     * @param localUsersResponse
     */
    private handleUsersResponse(localUsersResponse: { users: string[], requestId: string }) {
        /** Get request promise methods */
        const sentRequest = this.sentUsersRequestsMap[localUsersResponse.requestId];

        /** If timeout activation delete it. there is nothing else to do. */
        if (!sentRequest) {
            /** Too late... */
            return;
        }

        /** Remove request promise from map */
        delete this.sentHttpRequestsMap[localUsersResponse.requestId];

        /** Activate promise resolve method with response as is. */
        sentRequest.forwardPromise.resolve(localUsersResponse.users);
    }

    /**
     * Send http request to local server over ws channel.
     * @param localServerId local server to send rrquest for.
     * @param httpRequest http request message to send.
     * @returns Http response message.
     */
    public async sendHttpViaChannels(localServerId: string, httpRequest: HttpRequest): Promise<HttpResponse> {

        /** Try getting require local server  */
        const localServer = await this.localServersBl.getlocalServersById(localServerId);

        /**
         * Create promise to allow hold resolve/reject in map and wait for local server response.
         * (like we already know, ws is message based and not req/res based).
         */
        return new Promise<HttpResponse>((resolveHttpReq, rejectHttpReq) => {
            /** Get correct local server ws channel */
            const localServeChannel = this.localChannelsMap[localServer.macAddress];

            /** If channel not exist, mean there is no communication with local server. */
            if (!localServeChannel) {
                /** Send local server not availbe response */
                resolveHttpReq({
                    requestId: httpRequest.requestId,
                    httpBody: {
                        responseCode: 4501,
                        message: 'There is no connection to local server.',
                    } as ErrorResponse,
                    httpStatus: 501,
                    httpSession: undefined,
                });
                return;
            }

            /** Generate uniqe id to each request to know witch response belong to current request  */
            const reqId = randomstring.generate(16);
            httpRequest.requestId = reqId;

            /** Add request promise methods to map  */
            this.sentHttpRequestsMap[reqId] = {
                timeStamped: new Date(),
                forwardPromise: {
                    reject: rejectHttpReq as () => {},
                    resolve: resolveHttpReq as () => {},
                },
            };

            /** Send request to local server to procces it. */
            this.sendMessage(localServeChannel, {
                remoteMessagesType: 'httpRequest',
                message: {
                    httpRequest,
                },
            });
        });
    }

    /**
     * Request all local server users names.
     * See comments on sendHttpViaChannels function, it`s same.
     *
     * @param localServerId local server to get users from.
     */
    public async getLocalServerUsers(localServerId: string): Promise<string[]> {
        /** Try getting require local server  */
        const localServer = await this.localServersBl.getlocalServersById(localServerId);

        /**
         * See comments on sendHttpViaChannels function, it`s same.
         */
        return new Promise<string[]>((resolveUsersReq, rejectUsersReq) => {
            const localServeChannel = this.localChannelsMap[localServer.macAddress];

            if (!localServeChannel) {
                rejectUsersReq({
                    responseCode: 4501,
                    message: 'There is no connection to local server.',
                } as ErrorResponse);
                return;
            }

            const reqId = randomstring.generate(16);

            this.sentUsersRequestsMap[reqId] = {
                timeStamped: new Date(),
                forwardPromise: {
                    reject: rejectUsersReq as () => {},
                    resolve: resolveUsersReq as () => {},
                },
            };

            this.sendMessage(localServeChannel, {
                remoteMessagesType: 'localUsers',
                message: {
                    localUsers: {
                        requestId: reqId,
                    },
                },
            });
        });
    }

    /**
     * On ws just opend.
     * @param wsChannel local server incomming ws.
     */
    public onWsOpen(wsChannel: ws) {
        /** Send to local server ready to init and auth message. */
        this.sendMessage(wsChannel, { remoteMessagesType: 'readyToInitialization', message: {} });
    }

    /**
     * On message arrived from local server.
     * @param wsChannel local server ws channel.
     * @param localMessage message content.
     */
    public async onWsMessage(wsChannel: CasaWs, localMessage: LocalMessage) {

        /** If it`s init message handle it, else check access cert befor handling. */
        if (localMessage.localMessagesType === 'initialization') {
            await this.handleInitializationRequest(wsChannel, localMessage.message.initialization);
            return;
        }

        /** If ws object not own machine mac, dont allow it to do anything. */
        if (!(wsChannel.machineMac in this.localChannelsMap)) {
            logger.debug(`aborting local server message, there is no vaild mac address stamp.`);
            return;
        }

        /** Make sure local server session is valid. */
        try {
            const localServer = await this.localServersBl.getlocalServersByMac(wsChannel.machineMac);
            await this.localServersSessionsBl.getlocalServerSession(localServer.localServerId);
        } catch (error) {
            logger.debug(`aborting local server message handling, there is no vaild session.`);
            return;
        }

        /** Route message to correct handler. */
        switch (localMessage.localMessagesType) {
            case 'httpResponse': this.handleHttpResponse(localMessage.message.httpResponse); break;
            case 'ark': this.sendMessage(wsChannel, { remoteMessagesType: 'arkOk', message: {} }); break;
            case 'localUsers': this.handleUsersResponse(localMessage.message.localUsers); break;
            case 'feed': await this.handleFeedUpdate(wsChannel, localMessage.message.feed); break;
        }
    }

    /**
     * On any ws channel closed, from any reasone.
     * @param wsChannel closed ws channel.
     */
    public onWsClose(wsChannel: CasaWs) {
        /** If channel passed auth  */
        if (wsChannel.machineMac) {
            /** Remove it from channel map. */
            delete this.localChannelsMap[wsChannel.machineMac];
        }
    }

    /**
     * Send remote message to local server.
     * @param wsChannel ws to send by.
     * @param remoteMessage message to send.
     */
    private sendMessage(wsChannel: ws, remoteMessage: RemoteMessage) {
        try { wsChannel.send(JSON.stringify(remoteMessage)); } catch (error) { }
    }
}

export const ChannelsBlSingleton = new ChannelsBl(LocalServersBlSingleton, LocalServersSessionBlSingleton);
