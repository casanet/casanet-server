import AdmZip = require('adm-zip');
import * as chai from 'chai';
import * as path from 'path';
import * as fse from 'fs-extra';
import chaiHttp = require('chai-http');
import * as express from 'express';
import { Express, Router } from 'express';
import moment = require('moment');
import { WebSocketClient } from 'reconnecting-ws';
import { RemoteConnectionDal } from '../data-layer/remoteConnectionDal';
import { RemoteConnectionDalSingleton } from '../data-layer/remoteConnectionDal';
import { HttpRequest, LocalMessage, RemoteMessage } from '../models/remote2localProtocol';
import {
  ErrorResponse,
  MinionFeed,
  RemoteConnectionStatus,
  RemoteSettings,
  TimingFeed,
} from '../models/sharedInterfaces';
import { binaryResponseParser } from '../utilities/binaryParser';
import { logger, LOGS_DIR, LOG_FILE_EXTENSION, LOG_FILE_NAME } from '../utilities/logger';
import { getMachineMacAddress } from '../utilities/macAddress';
import { MinionsBl } from './minionsBl';
import { MinionsBlSingleton } from './minionsBl';
import { TimingsBl } from './timingsBl';
import { TimingsBlSingleton } from './timingsBl';
import { VersionsBlSingleton } from './versionsBl';
import { serverFqdn } from '../config';

/**
 * Used to connect remote server via web socket, and let`s users access
 */
export class RemoteConnectionBl {
  private ACK_INTERVAL = moment.duration(30, 'seconds');
  private REMOTE_REQUEST_TIMEOUT = moment.duration(20, 'seconds');
  private ackPongReceived = true;

  /** Hold register requests promise functions */
  private registerAccountsPromisesMap: {
    [key: string]: {
      resolve: () => {};
      reject: (errorResponse: ErrorResponse) => {};
      timeout: NodeJS.Timeout;
    };
  } = {};

  /** Hold get register users requests promise */
  private requestRegisteredUsersPromises: {
    resolve: (registeredUsers: string[]) => {};
    reject: (errorResponse: ErrorResponse) => {};
    timeout: NodeJS.Timeout;
  };

  /** Express router, used to create http requests from
   * remote server without actually open TCP connection.
   */
  private expressRouter: express.Express;

  /** Hold the remote connection status */
  private remoteConnectionStatus: RemoteConnectionStatus = 'cantReachRemoteServer';

  /** Web socket client object, to connect remote server  */
  private webSocketClient: WebSocketClient;

  /**
   * Init remote connection bl. using dependency injection pattern to allow units testings.
   * @param remoteConnectionDal Inject the remote connection dal..
   * @param minionsBl Inject the minions bl instance to used minionsBl.
   * @param timingsBl Inject the timings bl instance to used timingsBl.
   */
  constructor(
    private remoteConnectionDal: RemoteConnectionDal,
    private minionsBl: MinionsBl,
    private timingsBl: TimingsBl,
  ) {

  }

  public async initRemoteConnectionModule() {
    /** Use chai testing lib, to mock http requests */
    chai.use(chaiHttp);

    /** Connect to remote server */
    this.connectToRemote();

    /** Subscribe to minions feed, to forward remote server */
    this.minionsBl.minionFeed.attach((minionFeed: MinionFeed) => {
      if (this.remoteConnectionStatus !== 'connectionOK') {
        return;
      }

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
    this.timingsBl.timingFeed.attach((timingFeed: TimingFeed) => {
      if (this.remoteConnectionStatus !== 'connectionOK') {
        return;
      }

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
       * don't send ack message.
       * (If remote server not set yet, there is no point to try sending ack).
       */
      if (this.remoteConnectionStatus !== 'connectionOK' && this.remoteConnectionStatus !== 'cantReachRemoteServer') {
        logger.debug(`[RemoteConnectionBl][initRemoteConnectionModule] remoteConnectionStatus "${this.remoteConnectionStatus}" ignoring ping send`)
        return;
      }

      if (!this.ackPongReceived) {
        logger.warn('[RemoteConnectionBl][initRemoteConnectionModule] There is no pong respond, marking "remoteConnectionStatus" as "cantReachRemoteServer" and closing channel')
        this.remoteConnectionStatus = 'cantReachRemoteServer';
        this.closeRemoteConnection();
        this.connectToRemote();
        return;
      }

      logger.info('[RemoteConnectionBl][initRemoteConnectionModule] Remote connection is OK, sending ping...')
      this.remoteConnectionStatus = 'connectionOK';

      this.ackPongReceived = false;
      this.sendMessage({
        localMessagesType: 'ack',
        message: {},
      });
    }, this.ACK_INTERVAL.asMilliseconds());
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
    logger.info('[RemoteConnectionBl][removeRemoteSettings] Removing & disconnecting remote server...')
    this.closeRemoteConnection();
    this.remoteConnectionStatus = 'notConfigured';
    await this.remoteConnectionDal.deleteRemoteSettings();
  }

  /**
   * Request from the remote server to send code to email befor register account request
   * @param email user email account
   */
  public async requestSendUserRegisterCode(email: string) {
    if (this.remoteConnectionStatus !== 'connectionOK') {
      throw {
        message: 'There is no connection to remote server',
        responseCode: 6501,
      } as ErrorResponse;
    }

    await this.sendMessage({
      localMessagesType: 'sendRegistrationCode',
      message: {
        sendRegistrationCode: {
          email,
        },
      },
    });
  }

  /**
   * Remove account from local server valid account to forward from remote to local
   * @param email user email account
   */
  public unregisterUserFromRemoteForwarding(email: string): Promise<void | ErrorResponse> {
    if (this.remoteConnectionStatus !== 'connectionOK') {
      throw {
        message: 'There is no connection to remote server',
        responseCode: 6501,
      } as ErrorResponse;
    }

    return new Promise<void | ErrorResponse>(async (resolve, reject) => {
      this.sendMessage({
        localMessagesType: 'unregisterAccount',
        message: {
          unregisterAccount: {
            email,
          },
        },
      });

      this.registerAccountsPromisesMap[email] = {
        resolve: resolve as any,
        reject: reject as any,
        timeout: setTimeout(() => {
          reject({
            message: 'remote server timeout',
            responseCode: 12503,
          } as ErrorResponse);
        }, this.REMOTE_REQUEST_TIMEOUT.asMilliseconds()),
      };
    });
  }

  /**
   * Register account to allow forward HTTP requests from remote to local server
   * @param email user email account
   * @param code auth. code that sent by remote server to email.
   */
  public registerUserForRemoteForwarding(email: string, code: string): Promise<void | ErrorResponse> {
    if (this.remoteConnectionStatus !== 'connectionOK') {
      throw {
        message: 'There is no connection to remote server',
        responseCode: 6501,
      } as ErrorResponse;
    }

    return new Promise<void | ErrorResponse>(async (resolve, reject) => {
      await this.sendMessage({
        localMessagesType: 'registerAccount',
        message: {
          registerAccount: {
            email,
            code,
          },
        },
      });

      this.registerAccountsPromisesMap[email] = {
        resolve: resolve as any,
        reject: reject as any,
        timeout: setTimeout(() => {
          reject({
            message: 'remote server timeout',
            responseCode: 12503,
          } as ErrorResponse);
        }, this.REMOTE_REQUEST_TIMEOUT.asMilliseconds()),
      };
    });
  }

  /**
   * Get registered users of current local server from the remote server.
   */
  public getRegisteredUsersForRemoteForwarding(): Promise<string[]> {
    if (this.remoteConnectionStatus !== 'connectionOK') {
      throw {
        message: 'There is no connection to remote server',
        responseCode: 6501,
      } as ErrorResponse;
    }

    return new Promise<string[]>(async (resolve, reject) => {
      await this.sendMessage({
        localMessagesType: 'registeredUsers',
        message: {},
      });

      this.requestRegisteredUsersPromises = {
        resolve: resolve as any,
        reject: reject as any,
        timeout: setTimeout(() => {
          reject({
            message: 'remote server timeout',
            responseCode: 12503,
          } as ErrorResponse);
        }, this.REMOTE_REQUEST_TIMEOUT.asMilliseconds()),
      };
    });
  }

  /**
   * Send a message to remote server.
   * @param localMessage message to send
   */
  private sendMessage(localMessage: LocalMessage) {
    // Dont even try to send message in cause remote server not configured al all
    if (this.remoteConnectionStatus !== 'connectionOK' && this.remoteConnectionStatus !== 'cantReachRemoteServer') {
      return;
    }
    try {
      this.webSocketClient.sendData(JSON.stringify(localMessage));
    } catch (error) {
      logger.error(`[RemoteConnectionBl.sendMessage] sending message to remote server "${localMessage.localMessagesType}" failed, ${error.message}`);

      // In case of failure, close the connection, and try to reopen it from scratch
      if (localMessage.localMessagesType === 'ack') {
        logger.info(`[RemoteConnectionBl.sendMessage] During the WS error, manually closing the WS, and reopening ...`);
        this.remoteConnectionStatus = 'cantReachRemoteServer';
        this.closeRemoteConnection();
        this.connectToRemote();
      }
    }
  }

  /** Close manually web socket to remote server */
  private closeRemoteConnection() {
    logger.info(`[RemoteConnectionBl.closeRemoteConnection] Closing remote channel ...`);
    try {
      this.webSocketClient.disconnect();
    } catch (error) { }
  }

  /** Connect to remote server by web sockets */
  private async connectToRemote() {
    logger.info(`[RemoteConnectionBl.connectToRemote] Connecting to remote channel ...`);

    /** Get remote server settings */
    const remoteSettings = await this.remoteConnectionDal.getRemoteSettings();

    /** If there is not settings */
    if (!remoteSettings) {
      this.remoteConnectionStatus = 'notConfigured';
      logger.debug('There is no connection configuration to remote server.');
      return;
    }

    /** Before the channel opened, mark it as 'cantReachRemoteServer' (yet..) */
    this.remoteConnectionStatus = 'cantReachRemoteServer';

    /** create web socket instance */
    this.webSocketClient = new WebSocketClient(3000, false);

    this.webSocketClient.on('open', () => {
      this.ackPongReceived = true;
      this.remoteConnectionStatus = 'connectionOK';
      logger.info(`[RemoteConnectionBl.connectToRemote][on-open] Ws channel to ${remoteSettings.host} opened successfully`);
    });

    this.webSocketClient.on('message', async (rawRemoteMessage: string) => {
      try {
        this.ackPongReceived = true;
        await this.onRemoteServerMessage(rawRemoteMessage);
      } catch (error) {
        logger.error(`[RemoteConnectionBl.connectToRemote][on-message] Ws message parsing & handling filed row message: ${rawRemoteMessage}\n error ${error.message || JSON.stringify(error)}`);
      }
    });

    this.webSocketClient.on('error', (err: Error) => {
      logger.error(`[RemoteConnectionBl.connectToRemote][on-error] Ws channel error ${err.message}`);
    });

    this.webSocketClient.on('close', (code: number, reason: string) => {
      logger.info(`[RemoteConnectionBl.connectToRemote][on-close] Ws channel closed ${remoteSettings.host} code: ${code} reason: ${reason}`);
      if (this.remoteConnectionStatus !== 'connectionOK') {
        return;
      }
      this.remoteConnectionStatus = 'cantReachRemoteServer';
    });

    this.webSocketClient.on('reconnect', () => {
      logger.info(`[RemoteConnectionBl.connectToRemote][on-reconnect] Ws channel trying reconnect ${remoteSettings.host}`);
    });

    logger.info(`[RemoteConnectionBl.connectToRemote] Opening ws channel to ${remoteSettings.host}`);

    /** Allow *only wss* connections. */
    /** open connection to remote server. */
    this.webSocketClient.connect(`${remoteSettings.host}`);
  }

  private async onRemoteServerMessage(rawRemoteMessage: string) {
    /** Parse message and send to correct method handle */
    const remoteMessage: RemoteMessage = JSON.parse(rawRemoteMessage);
    // Don't log all ack messages...
    if (remoteMessage.remoteMessagesType !== 'ackOk') {
    }
    switch (remoteMessage.remoteMessagesType) {
      case 'readyToInitialization':
        await this.onInitReady();
        break;
      case 'authenticationFail':
        await this.onAuthenticationFail(remoteMessage.message[remoteMessage.remoteMessagesType]);
        break;
      case 'authenticatedSuccessfully':
        await this.onAuthenticatedSuccessfully();
        break;
      case 'registerUserResults':
        await this.onRegisterUserResults(remoteMessage.message[remoteMessage.remoteMessagesType]);
        break;
      case 'registeredUsers':
        await this.onRegisteredUsersDataArrived(remoteMessage.message[remoteMessage.remoteMessagesType]);
        break;
      case 'ackOk':
        await this.OnArkOk();
        break;
      case 'httpRequest':
        await this.onRemoteHttpRequest(remoteMessage.message[remoteMessage.remoteMessagesType]);
        break;
      case 'fetchLogs':
        await this.onLogsRequest();
        break;
    }
  }

  private async OnArkOk() {
    logger.info('[RemoteConnectionBl][OnArkOk] Remote connection sent pong');
    this.ackPongReceived = true;
    this.remoteConnectionStatus = 'connectionOK';
  }

  private async onLogsRequest() {
    const zip = new AdmZip();
    logger.info('[RemoteConnectionBl][onLogsRequest] Remote request for logs arrived');

    const remoteSettings = await this.remoteConnectionDal.getRemoteSettings();
    if (remoteSettings.blockLogsFetchByRemote) {
      logger.info('[RemoteConnectionBl][onLogsRequest] Fetch logs by remote server is blocked by user, returning empty logs');
      const fileName = `fetch_logs_blocked`;
      const buffer = Buffer.from(fileName);
      zip.addFile(fileName, buffer);
    } else {
      for (let index = 0; index < 5; index++) {
        const fileName = `${LOG_FILE_NAME}${index || ''}.${LOG_FILE_EXTENSION}`;
        const buffer = await fse.promises.readFile(path.join(LOGS_DIR, fileName));
        zip.addFile(fileName, buffer);
      }
    }


    const logsData = zip.toBuffer().toString('base64');
    logger.info(`[RemoteConnectionBl][onLogsRequest] Logs are ready, string length ${logsData.length}`);
    this.sendMessage({
      localMessagesType: 'logs',
      message: {
        logs: logsData,
      }
    });
    logger.info(`[RemoteConnectionBl][onLogsRequest] Logs has been sent`);
  }

  private onRegisterUserResults(forwardUserResults: { user: string; results?: ErrorResponse }) {
    const { user, results } = forwardUserResults;

    if (!this.registerAccountsPromisesMap[user]) {
      return;
    }

    /** Get the request promise functions */
    const requestPromises = this.registerAccountsPromisesMap[user];

    /** Clear the timeout function */
    clearTimeout(requestPromises.timeout);

    /** If all ok, invoke the resolve function */
    if (!results) {
      requestPromises.resolve();
    } else {
      /** Else invoke the reject function with error */
      requestPromises.reject(results);
    }

    /** remote user from request promises map. */
    delete this.registerAccountsPromisesMap[user];
  }

  private onRegisteredUsersDataArrived(registeredUsers: string[]) {
    if (!this.requestRegisteredUsersPromises) {
      return;
    }

    /** Clear the timeout function */
    clearTimeout(this.requestRegisteredUsersPromises.timeout);

    this.requestRegisteredUsersPromises.resolve(registeredUsers);

    /** Throw promisses away. */
    this.requestRegisteredUsersPromises = undefined;
  }

  /** Handle auth passed messages from remote server */
  private async onAuthenticatedSuccessfully() {
    logger.info(`[RemoteConnectionBl.onAuthenticatedSuccessfully] Successfully authenticated to remote server.`);
    this.remoteConnectionStatus = 'connectionOK';
  }

  /**
   * Handle auth fail message from remote server.
   * @param errorResponse Error message from remote server.
   */
  private async onAuthenticationFail(errorResponse: ErrorResponse) {
    logger.error(`[RemoteConnectionBl.onAuthenticationFail] Authenticate local server in remote server fail, ${errorResponse.message}`);
    this.closeRemoteConnection();

    if (errorResponse.responseCode !== 13501) {
      logger.info(`[RemoteConnectionBl.onAuthenticationFail] Setting remoteConnectionStatus as 'authorizationFail'`);
      this.remoteConnectionStatus = 'authorizationFail';
    } else {
      this.remoteConnectionStatus = 'cantReachRemoteServer';
    }
  }

  /**
   * On remote server ready to local authentication request.
   */
  private async onInitReady() {
    try {
      const machineAddress = await getMachineMacAddress();
      const remoteSettings = await this.remoteConnectionDal.getRemoteSettings();

      if (!remoteSettings) {
        logger.error(`[RemoteConnectionBl.onInitReady] There is no way to connect remote server, remote settings data not exist`);
        this.closeRemoteConnection();
        logger.info(`[RemoteConnectionBl.onInitReady] Setting remoteConnectionStatus as 'notConfigured'`);
        this.remoteConnectionStatus = 'notConfigured';
        return;
      }

      this.sendMessage({
        localMessagesType: 'initialization',
        message: {
          initialization: {
            macAddress: machineAddress,
            remoteAuthKey: remoteSettings.connectionKey,
            platform: process.platform,
            version: (await VersionsBlSingleton.getCurrentVersion())?.version || 'unknown',
            localIp: serverFqdn(),
          },
        },
      });
    } catch (error) {
      logger.error(`[RemoteConnectionBl.onInitReady] There is no way to connect remote server, fail to get init connection ${error}`);
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
      case 'GET':
        request = requestAgent.get(httpRequest.httpPath);
        break;
      case 'POST':
        request = requestAgent.post(httpRequest.httpPath);
        break;
      case 'PUT':
        request = requestAgent.put(httpRequest.httpPath);
        break;
      case 'DELETE':
        request = requestAgent.del(httpRequest.httpPath);
        break;
    }
    /** set cookie header */
    request.set('Cookie', `session=${httpRequest.httpSession}`);

    /** send request and wait for response */
    const response = await request.send(httpRequest.httpBody).buffer().parse(binaryResponseParser);

    /** Send the body as string, so select the string encoding based on the response type */
    let httpBody = '';
    switch (response.type) {
      case 'application/octet-stream': {
        httpBody = response.body.toString('base64');
        break;
      }
      case 'application/json': {
        httpBody = response.body.toString('utf8');
        break;
      }
      default:
        httpBody = response.body.toString('utf8');
    }

    /** send response back to remote server */
    this.sendMessage({
      localMessagesType: 'httpResponse',
      message: {
        httpResponse: {
          requestId: httpRequest.requestId,
          httpStatus: response.status,
          httpBody,
          httpSession: this.extractCookie(response.header),
          httpHeaders: response.header,
        },
      },
    });
  }

  /** Extract http cookie from http headers response  */
  private extractCookie(headers: {}): { key: string; maxAge: number } {
    try {
      if (!headers['set-cookie']) {
        return;
      }
      const sessionParts = headers['set-cookie'][0].split(';');
      return {
        key: sessionParts[0].split('=')[1],
        maxAge: parseInt(sessionParts[1].split('=')[1], 10),
      };
    } catch (error) {
      return;
    }
  }
}

export const RemoteConnectionBlSingleton = new RemoteConnectionBl(
  RemoteConnectionDalSingleton,
  MinionsBlSingleton,
  TimingsBlSingleton,
);
