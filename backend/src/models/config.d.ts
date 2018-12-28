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