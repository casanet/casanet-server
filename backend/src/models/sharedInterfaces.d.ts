/**
* Error response.
*/
export declare interface ErrorResponse {
    /**
     * error code in system.
     */
    responseCode: number;

    /**
     * Readble message.
     */
    message?: string;
}

/**
 * Operation result s, hold set minion status result per minion.
 */
export declare interface OperationResult {
    /**
     * Minion Id.
     */
    minionId: string;

    /**
     * Set a minion status results. (undefined if sets successfully).
     */
    error?: ErrorResponse;
}

/** Optional status on a remote connection */
export declare type RemoteConnectionStatus =
    /** There are no remote settings.. */
    'notConfigured' |
    /** From some reason the connection to remote server offline. */
    'cantReachRemoteServer' |
    /** The remote server has thrown authorization of the local server. */
    'authorizationFail' |
    /** Local server disconnected. (When using a remote server, and the local server disconnected). */
    'localServerDisconnected' |
    /** Connection OK. */
    'connectionOK';

/**
 * Remote server settings.
 */
export declare interface RemoteSettings {
    /** hostname / IP of the remote server */
    host: string;
    /** Access key for authorization local server in the remote server */
    connectionKey: string;
}

/**
 * Login schema model.
 */
export declare interface Login {
    email: string;
    password: string;
}


/**
 * Represents any physical device in a local network.
 */
export declare interface LocalNetworkDevice {

    /**
     * Display name.
     */
    name?: string;

    /**
     * The MAC address of the device, the value is unique to each device.
     */
    mac: string;

    /**
     * Info about device manufacturer.
     */
    vendor?: string;

    /**
     * The device IP address, if exist it should be unique in network.
     */
    ip?: string;
}

/**
 * Represents a physical device kind with network info. 
 */
export declare interface MinionDevice {

    /**
     * The physical network device.
     */
    pysicalDevice: LocalNetworkDevice;

    /**
     * The brand of device.
     */
    brand: string;

    /**
     *  The specific model of the device.
     */
    model: string;

    /**
     *Some devices require a token for communication API.
     */
    token?: string;

    /**
     * Some devices require id for communication API.
     */
    deviceId?: string;
}


/**
 * For each supported device, there are limitations and abilities of it.
 */
export declare interface DeviceKind {
    /**
     * The brand of the current minion type. (see device model).
     */
    brand: string;

    /**
     * The specific model of minion type. (see device model).
     */
    model: string;

    /**
     * The max minions that can be in one device, or -1 if unlimited.
     * For example, a simple smart socket can be 1 minion per device, 
     * Wall switch with 3 switches can be 3 minions per device,
     * And IR transmitter can be unlimited minions per device.
     */
    minionsPerDevice: number;

    /**
     * Is the device require a token for communication API.
     */
    isTokenRequierd: boolean;

    /**
     * Is device require id for communication API.
     */
    isIdRequierd: boolean;

    /**
     * Supported minion type for the current device.
     */
    suppotedMinionType: MinionTypes;

    /**
     * Some of the devices supported recording (for example IR transmitter).
     */
    isRecordingSupported: boolean;
}

/**
 * Scopes of authentication, right know in our system there are only 3 scopes.
 * admin and user. any API route protect by one of them.
 */
export declare type AuthScopes = 'adminAuth' | 'userAuth' | 'iftttAuth';

/**
 * Represents a user in the system. 
 */
export declare interface User {

    /**
     *  Name
     */
    displayName?: string;

    /**
     * User email
     */
    email: string;

    /**
     * User password.
     */
    password?: string;

    /**
     * Ignore 2-step verification on login or not.
     */
    ignoreTfa: boolean;

    /**
     * User scopes.
     */
    scope: AuthScopes;
}

/**
 * Supported minions types.
 */
export declare type MinionTypes = 'toggle' | 'switch' | 'roller' | 'cleaner' | 'airConditioning' | 'light' | 'temperatureLight' | 'colorLight';

/**
 * Supported timings types.
 */
export declare type TimingTypes = 'dailySunTrigger' | 'dailyTimeTrigger' | 'once' | 'timeout';

/**
 * Days in week.
 */
export declare type DaysOptions = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

/**
 * Sun triggers.
 */
export declare type SunTriggerOptions = 'sunrise' | 'sunset';

/**
 * Valid AC mode.
 */
export declare type ACModeOptions = 'hot' | 'cold' | 'dry' | 'auto';

/**
 * Valid fan strength.
 */
export declare type FanStrengthOptions = 'low' | 'med' | 'high' | 'auto';

/**
 * Switches option
 */
export declare type SwitchOptions = 'on' | 'off';

/**
 * Roller direction
 */
export declare type RollerDirection = 'up' | 'down';

/**
 * Cleaner mode
 */
export declare type CleanerMode = 'dock' | 'clean';

/**
 * A toggle value, the toggle is on way communicated device,
 * For example wall light switches with 433 RF that can turn on or off 
 * but there is no way to know the real light status if someone changes the light status using physical switche. 
 */
export declare interface Toggle {
    status: SwitchOptions
}

/**
 * A switch status.
 *  Used for simple devices that can be turned on or off. *and minion status is readable*
 * The properties same as a toggle, and the difference is logic only (if that status is readable or not).
 */
export declare interface Switch extends Toggle {

}

/**
 * A roller switch stauts.
 * A roller is a switch for curtains or blinds (or for any other needs) that can drag up/down or stop.
 */
export declare interface Roller extends Switch {
    /** drag direction */
    direction: RollerDirection
}

/**
 * A Cleaner (robot) stauts.
 * Cleaner is a smart robot for cleaning home.
 */
export declare interface Cleaner extends Switch {
    /** Cleaner mode */
    mode: CleanerMode;
    /** Suction strength */
    fanSpeed: FanStrengthOptions;
}

/**
 * An AC status.
 */
export declare interface AirConditioning extends Switch {
    /**
     * Valid AC temperatur. (minimum 16° maximum 30°).
     * @minimum 16
     * @maximum 30 
     * @isInt true
     */
    temperature: number;
    mode: ACModeOptions;
    fanStrength: FanStrengthOptions;
}

/**
 * A simple light status.
 * Used to devices that can chang it's brightness.
 */
export declare interface Light extends Switch {
    /**
     * Minimum 1% maximum 100% of light brightness.
     * @minimum 1
     * @maximum 100 
     * @isInt true
     */
    brightness: number;
}

/**
 * A light simple light status.
 * Used to devices that can chang also light temperature (warm or cold light).
 */
export declare interface TemperatureLight extends Light {
    /**
     * Spectrum is 1% to warm light and 100% to cold light.
     * @minimum 1
     * @maximum 100 
     * @isInt true
     */
    temperature: number;
}

/**
 * A light simple light status.
 * Used to devices that can change also light color (RGB).
 */
export declare interface ColorLight extends TemperatureLight {
    /**
     * Minimum 0 maximum 255 from red color.
     * Valid color value. (8 bits number, minimum 0 maximum 255).
     * @minimum 0
     * @maximum 255
     * @isInt true
     */
    red: number;
    /**
     * Minimum 0 maximum 255 from green color.
     * Valid color value. (8 bits number, minimum 0 maximum 255).
     * @minimum 0
     * @maximum 255
     * @isInt true
     */
    green: number;
    /**
     * Minimum 0 maximum 255 from blue color.
     * Valid color value. (8 bits number, minimum 0 maximum 255).
     * @minimum 0
     * @maximum 255
     * @isInt true
     */
    blue: number;
}

/**
 * Once timing struct.
 */
export declare interface OnceTiming {
    /**
     * UTC time.
     */
    date: number;
}

/**
 * Timeout timing struct.
 */
export declare interface TimeoutTiming {
    /**
     * UTC time.
     */
    startDate: number;

    /**
     *  Duration to activate timing from the start timeout time in minutes.
     */
    durationInMimutes: number;
}

/**
 * Daily timing struct.
 */
export declare interface DailyTiming {
    /**
     * Selected days in a week.
     */
    days: DaysOptions[];
}

/**
 * Daily timing based on sun triggers.
 */
export declare interface DailySunTrigger extends DailyTiming {
    /**
     * Minutes from the sun trigger.
     * can be before or after the sun triggers.
     * For example, to invoke 40 minutes before sunset set -40 and to invoke 40 minutes after sunset set 40.
     * 
     * NOTE! if the duration is more then minutes available in the day from the sun trigger time, the timing will not activate. 
     * for example if the sunset is in 18:00 and the duration set to 7*60 minutes, 
     * the activate time is not on the same day, so it will not activate at all.
     */
    durationMinutes: number;

    /**
     * Sun trigger.
     */
    sunTrigger: SunTriggerOptions;
}

/**
 * Daily timing based on time in a day.
 */
export declare interface DailyTimeTrigger extends DailyTiming {
    /**
     * The hour in a day.
     * @minimum 0
     * @maximum 23
     * @isInt true
     */
    hour: number;

    /**
     * Minutes in an hour.
     * @minimum 0
     * @maximum 59
     * @isInt true
     */
    minutes: number;
}

/**
 *  Minion status, the available values depend on the minion type.
 */
export declare interface MinionStatus {
    toggle?: Toggle;
    switch?: Switch;
    roller?: Roller;
    cleaner?: Cleaner;
    airConditioning?: AirConditioning;
    light?: Light;
    temperatureLight?: TemperatureLight;
    colorLight?: ColorLight;
}

/**
 * Feed update type enum.
 */
export declare type FeedEvent = 'created' | 'update' | 'removed';

/**
 * Minion feed object.
 */
export declare interface MinionFeed {
    event: FeedEvent;
    minion: Minion;
}

/**
 * Used to change the minion auto turn off the timeout value.
 */
export declare interface SetMinionAutoTurnOff {
    /** The timeout duration in ms, to turn off set 0 as valse. */
    setAutoTurnOffMS: number;
}

/**
 * Used to rename minion.
 */
export declare interface MinionRename {
    /** The new name to set. */
    name: string;
}

/**
 * Represents a minion in system.
 * Minion is a logic device in the system, meaning that a device is a physical device and minion is a logic device 
 * that uses a physical device to switch home kit status. For example, an IR transmitter can be one physical device 
 * for a few minions, one to central AC control and second for secondary AC control 
 * so in it will be two totally different minions that use one physical device.
 */
export declare interface Minion {
    /**
     * Minion unique id.
     */
    minionId?: string;

    /**
     * The display name for a minion.
     */
    name: string;

    /**
     * Physical device of minion. 
     */
    device: MinionDevice;

    /**
     * Is communication with device status ok.
     */
    isProperlyCommunicated?: boolean;

    /**
     * Status of minion (based on minion type).
     */
    minionStatus: MinionStatus;

    /**
     * Minion type.
     */
    minionType: MinionTypes;

    /**
     * Auto turns  off duration, *if* set member value then the minion will turn off in X ms after turning it on, 
     * Used for example in boiler minion etc.
     */
    minionAutoTurnOffMS?: number;
}

/**
 * Represents acivity.
 */
export declare interface OperationActivity {
    /** Minion id to set */
    minionId: string;

    /**
     * Status to set to minion.
     */
    minionStatus: MinionStatus;
}

/**
 * Represents an operation in the system.
 * An operation is a set of activities to do.
 * For example, to turn on all home light operation 
 * sets an array of activity for each light in the home to set light status 'on'.
 */
export declare interface Operation {
    /**
     * Operation unique id.
     */
    operationId: string;

    /**
     * Operation display name.
     */
    operationName: string;

    /**
     * Activities array.
     */
    activities: OperationActivity[];
}

/**
 * Timing properties, values depend on timing type.
 */
export declare interface TimingProperties {
    dailySunTrigger?: DailySunTrigger;
    dailyTimeTrigger?: DailyTimeTrigger;
    once?: OnceTiming;
    timeout?: TimeoutTiming;
}

/**
 * Timing feed object.
 */
export declare interface TimingFeed {
    timing: Timing;
    results: OperationResult[];
}

/**
 * Represents a timing in the system.
 */
export declare interface Timing {
    /**
     * Timing unique id.
     */
    timingId: string;

    /**
     * Timing display name.
     */
    timingName: string;

    /**
     * Operation id to invoke.
     */
    triggerOperationId: string;

    /**
     * Is timing active or not.
     */
    isActive: boolean;

    /**
     * The timing type.
     */
    timingType: TimingTypes;

    /**
     * The timing properties.
     */
    timingProperties: TimingProperties;
}

/** 
 * Ifttt webhook request body to notify minion status changed.
 * *Used in ifttt module interface only* 
 */
export declare interface IftttOnChanged {
    /** Allow remote-server to forward request to local server */
    localMac?: string;
    /** Device id (AKA Ifttt webhook API key), this is the authentication of request. */
    deviceId: string;
    /** The new status */
    newStatus: SwitchOptions;
}

/** Ifttt integration settings */
export declare interface IftttIntegrationSettings {
    /** WebHooks API key */
    apiKey?: string;
    /** Open or close ifttt integration. */
    enableIntegration: boolean;
}

/** Ifttt trigger action auth and forward fields */
export declare interface IftttActionTriggeredRequest {
    /** WebHooks API key */
    apiKey: string;
    /** Allow remote-server to forward request to local server */
    localMac?: string;
}

/** Ifttt trigger set status action */
export declare interface IftttActionTriggered extends IftttActionTriggeredRequest {
    setStatus: SwitchOptions;
}


/** Ifttt trigger with all request data in one JSON struct. */
export declare interface IftttRawActionTriggerd extends IftttActionTriggeredRequest {
    minionId: string;
    setStatus: SwitchOptions;
}

/** Update version results */
export declare interface UpdateResults {
    /** Application already in the latest version  */
    alreadyUpToDate: boolean;
}

/** Version info */
export declare interface VersionInfo {
    /** Latest version (Git Tag) name */
    version: string;
    /** Current local master/HEAD commit hash */
    commintHash: string;
    /** Time stamp of HEAD commint in UTC format */
    timestamp: number;
}

/** Version update progress status options */
export declare type UpdateStatus = 'inProgress' | 'finished' | 'fail';

/** Version update progress status info. */
export declare interface VersionUpdateStatus {
    updateStatus: UpdateStatus;
}

/** Minion timeline node */
export declare interface MinionTimeline {
    minionId: string;
    timestamp: number;
    status: MinionStatus;
}

/** Device in commands repo project. see https://github.com/haimkastner/rf-commands-repo. API section */
export declare interface CommandsRepoDevice {
    brand: string;
    model: string;
    category: string;
}