import { Login } from '../../../backend/src/models/sharedInterfaces'

/**
* Represents a local server in the system.
*/
export declare interface LocalServer {
    /** Local server id */
    localServerId: string;
    /** Display name */
    displayName: string;
    /** The local machine mac address should be unique. */
    macAddress: string;
    /** Users from the local server that can access via remote server. */
    validUsers: string[];
    /** Connection with local server status. */
    connectionStatus?: boolean;
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
