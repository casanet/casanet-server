import { User } from './sharedInterfaces';

/**
 * Session key and meta.
 */
declare interface Session {
    key: string;
    timeStump: number;
    email: string;
}

/**
 * Scopes of authentication, right know in our system there is only 2 scopes.
 * admin and user. any API route shuold protect by one of them.
 */
export declare interface AuthScopes {
    adminScope: string;
    userScope: string;
}

/**
 * Running application mode 
 */
export declare type RunningMode  = 'prod' | 'test' | 'debug';

/** Config staruct for all system */
export declare interface Config {
    /**
     * Default user to allow login in first use.
     */
    defaultUser: User,
    /** Http  configuration */
    http: {
        httpPort: number;
        httpsPort: number;
        useHttps: boolean;
    },
    /** Limit one IP requests per time configuration */
    requestsLimit: {
        windowsMs: number;
        maxRequests: number
    };
    runningMode : RunningMode;
}

/**
 * Data r/w file interface.
 * Use to allow r/w mock mode.
 */
export declare class IDataIO {

    /**
     * Get data sync.
     * Use it in init only. else the app will black until read finish.
     * @returns Data array.
     */
    public getDataSync(): any[];

    /**
     * Get file content as json objects array.
     */
    public getData(): Promise<any[]>;

    /**
     * Set json objects array as file content.
     * @param data 
     */
    public setData(data: any[]): Promise<void>;
}

/**
 * Session data layer interface.
 */
export declare class ISessionDataLayer {

    /**
     * Get all session as array.
     */
    public getSessions(): Promise<Session[]>;

   /**
     * Get session by session key.
     * @param key Find session by key.
     */
    public getSession(key: string): Promise<Session>;

    /**
     * Save new session.
     */
    public createSession(newSession: Session): Promise<void>;

    /**
     * Delete session. 
     */
    public deleteSession(session: Session): Promise<void>;
}

/**
 * Users data layer interface.
 */
export declare class IUsersDataLayer {

    /**
     * Get all users as array.
     */
    public getUsers(): Promise<User[]>;

   /**
     * Get users by user email.
     * @param email Find user by key.
     */
    public getUser(email: string): Promise<User>;

    /**
     * Save new users.
     */
    public createUser(newUser: User): Promise<void>;

    /**
     * Delete users. 
     */
    public deleteUser(user: User): Promise<void>;
}
