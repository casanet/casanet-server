import { ErrorResponse, MinionFeed, TimingFeed } from './sharedInterfaces';

/** Remote server to local server messages types */
export declare type RemoteMessagesType =
    /** When remote sever ready to authentication message from local */
    'readyToInitialization' |
    /** When local server successfult authenticated. */
    'authenticatedSuccessfuly' |
    /** When local server rejected, baucuase auth fail. */
    'authenticationFail' |
    /** Results of register/unregister user to forward from remove server */
    'registerUserResults' |
    /** Registered users of the certain local server  */
    'registeredUsers' |
    /** Remote server forwarding http request to local sever */
    'httpRequest' |
    /** When local ack message arrived to remote server */
    'ackOk';

/** Http request data */
export declare interface HttpRequest {
    /**
     * Remote request unique id.
     * The ws protocol is a two way messages based, and http is req/res based,
     * so the id allow remote server to know which response message from local
     * ws is belong to which request that waiting to answer from local server.
     */
    requestId: string;
    /** Request method (GET,PUT, etc) */
    httpMethod: string;
    /** Request path (for exampl. /API/Minions) */
    httpPath: string;
    /** Request session key */
    httpSession: string;
    /** Request body data */
    httpBody: any;
}

/** WS message from remote to local struct */
export declare interface RemoteMessage {
    remoteMessagesType: RemoteMessagesType;
    message: {
        authenticationFail?: ErrorResponse;
        httpRequest?: HttpRequest;
        registerUserResults?: {
            user: string;
            results?: ErrorResponse;
        },
        registeredUsers?: string[];
    };
}

/** Local server to remote server messages types */
export declare type LocalMessagesType =
    /** Init connection and auth local server message */
    'initialization' |
    /** Request remote server to send registration code */
    'sendRegistrationCode' |
    /** Register account to allow forward HTTP requests from remote to local server */
    'registerAccount' |
    /** Remove account from local server valid account to forward from remote to local */
    'unregisterAccount' |
    /** Request all registered users for forwards of the current local server */
    'registeredUsers' |
    /** Http response with result for remote server request */
    'httpResponse' |
    /** Empty message to check if connection alive */
    'ack' |
    /** Update remote server with feed of local server, like minion status changed etc. */
    'feed';

/** Http response data */
export declare interface HttpResponse {
    /** Remote server request id, that this response answer on it. */
    requestId: string;
    /** Http status code result */
    httpStatus: number;
    /** Http data result */
    httpBody: any;
    /** Http session result (used in login requests only) */
    httpSession?: {
        /** Session key */
        key: string;
        /** Session expires time in seconds. */
        maxAge: number;
    };
}

export declare interface LocalServerFeed {
    feedType: 'minions' | 'timings';
    feedContent: MinionFeed | TimingFeed;
}

/** WS message from local to remote struct */
export declare interface LocalMessage {
    localMessagesType: LocalMessagesType;
    message: {
        initialization?: {
            macAddress: string;
            remoteAuthKey: string;
        };
        sendRegistrationCode?: {
            email: string;
        },
        unregisterAccount?: {
            email: string;
        },
        registerAccount?: {
            email: string;
            code: string;
        }
        httpResponse?: HttpResponse;
        feed?: LocalServerFeed;
    };
}
