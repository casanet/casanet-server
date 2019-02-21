import { Login } from '../../../backend/src/models/sharedInterfaces'

/**
* Reposents a local server in system.
*/
export declare interface LocalServer {
    /** Local server id */
    localServerId: string;
    /** Display name */
    displayName: string;
    /** The local machine mac addrress, should be uniqe */
    macAddress: string;
    /** Users from local server that can access via remote server */
    validUsers: string[];
    /** Connection with local server status */
    connectionStatus?: boolean;
}

/**
 * Info about local server.
 */
export declare interface LocalServerInfo {
    /** Local server id */
    localServerId: string;
    /** Display name */
    displayName: string;
}

/**
 * Extends login with local server selection, case use own more then one local server.
 * needs to know witch server to connect. 
 */
export declare interface LoginLocalServer extends Login {
    /**
     * Local server to login to. 
     * if user exsit only in one local server ignore field.
     */
    localServerId?: string;
}
