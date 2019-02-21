/**
 * Local server session.
 */
export declare interface LocalServerSession {
    /** The local mserver id. */
    localServerId: string;
    /** Local server auth key */
    keyHash: string;
}

/**
 * Session of forwarding user to local server.
 */
export declare interface ForwardUserSession {
    /** hash of session from local server to auth  */
    sessionKeyHash: string;
    /** local server to forward */
    localServerId: string;
}