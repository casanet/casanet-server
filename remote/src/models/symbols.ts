import { Login } from '../../../backend/src/models/sharedInterfaces';
import { LocalServer } from './';

/**
 * Scopes of authentication, right know in our system there are only 3 scopes.
 * admin and user. any API route protect by one of them.
 */
export declare type AuthScopes = 'forwardAuth' | 'adminAuth' | 'iftttAuth';

/**
 * Info about local server status
 */
export declare interface LocalServerStatus extends LocalServer {
    /** Is local server connected */
    connectionStatus: boolean;
}

/**
 * Info about a local server.
 */
export declare interface LocalServerInfo {
    /** Local server id */
    localServerId: string;
    /** Display name */
    displayName: string;
}

/**
 * Extends login with local server selection,
 * case use owns more than one local server needs to know which server to connect.
 */
export declare interface LoginLocalServer extends Login {
    /**
     * Local server to login to.
     * if the user exists only in one local server ignore the field.
     */
    localServerId?: string;
}

export declare interface ForwardSession {
    /** physical address of the local server to forward */
    server: string;
    /** local server session key */
    session: string;
    /** session owner */
    localUser: string;
}
