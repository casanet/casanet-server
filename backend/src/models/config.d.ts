/**
 * Scopes of authentication, right know in our system there is only 2 scopes.
 * admin and user. any API route shuold protect by one of them.
 */
export declare interface AuthScopes {
    adminScope: string;
    userScope: string;
}

/** Config staruct for all system */
export declare interface Config {
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
    data: {
        dataDirectory: string;
    }
}