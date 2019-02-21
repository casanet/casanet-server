import { ErrorResponse, MinionFeed, TimingFeed } from './sharedInterfaces';

/** Remote server to local server messages types */
export declare type RemoteMessagesType =
    /** When remote sever ready to authentication message from local */
    'readyToInitialization' |
    /** When local server successfult authenticated. */
    'authenticatedSuccessfuly' |
    /** When local server rejected, baucuase auth fail. */
    'authenticationFail' |
    /**
     * When remote server needs all user names in local server
     * (To allow remote admin select users that can access via remote)
     */
    'localUsers' |
    /** Remote server forwarding http request to local sever */
    'httpRequest' |
    /** When local ark message arrived to remote server */
    'arkOk';

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
        connectionFail?: ErrorResponse;
        httpRequest?: HttpRequest;
        localUsers?: {
            requestId: string;
        }
    };
}

/** Local server to remote server messages types */
export declare type LocalMessagesType =
    /** Init connection and auth local server message */
    'initialization' |
    /** Users names (only) in local server */
    'localUsers' |
    /** Http response with result for remote server request */
    'httpResponse' |
    /** Empty message to check if connection alive */
    'ark' |
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
    httpSession: string;
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
        localUsers?: {
            users: string[];
            requestId: string;
        },
        httpResponse?: HttpResponse;
        feed?: LocalServerFeed;
    };
}
