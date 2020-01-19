import {
  User,
  LocalNetworkDevice,
  DeviceKind,
  MinionStatus,
  Minion,
  ErrorResponse,
  AirConditioning,
  MinionTypes,
} from './sharedInterfaces';
import { Observable, Subscriber, BehaviorSubject } from 'rxjs';

/**
 * Session key and meta.
 */
declare interface Session {
  keyHash: string;
  timeStamp: number;
  email: string;
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
  defaultUser: User;
  /** Http  configuration */
  http: {
    httpPort: number;
    httpsPort: number;
    useHttps: boolean;
  };
  /**
   * Subnet (xxx.xxx.xxx) to scan devices in,
   * if undefined using current machine ip as default subnet to scan.
   */
  scanSubnet: string;
  /** Limit one IP requests per time configuration */
  requestsLimit: {
    windowsMs: number;
    maxRequests: number;
  };
  runningMode: RunningMode;
  /** Timeline length to keep statuses history, in days */
  timelineDaysLength: number;
  /**
   * 2-step verification config. access to mail using SMTP protocol.
   * *for keys use environment variables only!!!*
   */
  twoStepsVerification: {
    TwoStepEnabled: boolean;
    /**The mail server url, for example 'smtp.gmail.com' */
    smtpServer: string;
    /** The username to send from, for example 'myUser@gmail.com' */
    userName: string;
    /** The password / application key to access user account */
    userKey: string;
  };
  /**
   * Use for sun trigger timing when the sunset/sunrise depends on world location.
   */
  homePosition: {
    latitude: number;
    longitude: number;
  };
  keysHandling: {
    /** Salt keys by. */
    saltHash: string;
    /** Bcrypt salt rounds */
    bcryptSaltRounds: number;
  };
  /** Rf commands repo to fetch from see project page https://github.com/casanet/rf-commands-repo */
  commandsRepoUrl: string;
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

/** AC particular status command  */
export declare interface AirConditioningCommand {
  command: string;
  status: AirConditioning;
}

/** Toggle commands set */
export declare interface ToggleCommands {
  on: string;
  off: string;
}

/** Ac commands set */
export declare interface AcCommands {
  off: string;
  statusCommands: AirConditioningCommand[];
}

/** Roller commands set */
export declare interface RollerCommands {
  off: string;
  up: string;
  down: string;
}

/** RF (IR/433MHz etc.) commands set based of device type */
export declare interface CommandsSet {
  deviceType: MinionTypes;
  commands: {
    toggle?: ToggleCommands;
    airConditioning?: AcCommands;
    roller?: RollerCommands;
  };
}
