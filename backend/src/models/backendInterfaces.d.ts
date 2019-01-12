import { User, LocalNetworkDevice, DeviceKind, MinionStatus, Minion, ErrorResponse } from './sharedInterfaces';
import { Observable, Subscriber, BehaviorSubject } from 'rxjs';

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
export declare type RunningMode = 'prod' | 'test' | 'debug';

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
    runningMode: RunningMode;
    /**
     * Use for sun trigger timing when the sunset/sunrise depends on world location.
     */
    homePosition: {
        latitude: number;
        longitude: number;
    }
}


/**
 * Any smart devices brand communication module needs to implement.
 */
export declare class IMinionsBrandModule {
    /**
     * Brand name, should be unique in system.
     */
    public readonly brandName: string;

    /**
     * All supported devices via current module metadata.
     */
    public readonly devices: DeviceKind[];

    /**
     * Let minions manager to know if any minion status changed by pysical interface of device.
     */
    public minionStatusChangedEvent: BehaviorSubject<{
        mac: string;
        status: MinionStatus;
    }>;

    /**
     * Get current status of minion. (such as minion status on off etc.)
     */
    public getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse>;

    /**
     * Set minion new status. (such as turn minion on off etc.)
     * @param miniom minion to set status for.
     * @param setStatus the new status to set.
     */
    public setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse>;
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
