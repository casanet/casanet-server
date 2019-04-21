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
     * The time duration for a session in milliseconds (1/1000 from second). 
     */
    sessionTimeOutMS: number;

    /**
     * User password.
     */
    password: string;

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
export declare type MinionTypes = 'toggle' | 'switch' | 'airConditioning' | 'light' | 'temperatureLight' | 'colorLight';

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
 * Valid Hours in day.
 */
export declare type HourInDayOptions = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;

/**
 * Valid minutes in an hour.
 */
export declare type MinutesInHourOptions = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 |
    26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 |
    51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59;

/**
 * Valid AC temperatur. (minimum 16° maximum 30°).
 */
export declare type TemperatureOptions = 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30;

/**
 * Valid percent values. (minimum 1% maximum 100%).
 */
export declare type PercentOptions = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 |
    26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 |
    51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 |
    76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100;

/**
* Valid color value. 8 bits number. (minimum 0 maximum 255).
*/
export declare type ColorOptions = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 |
    26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 |
    51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 | 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 |
    76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 |
    101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 | 120 | 121 | 122 | 123 | 124 | 125 |
    126 | 127 | 128 | 129 | 130 | 131 | 132 | 133 | 134 | 135 | 136 | 137 | 138 | 139 | 140 | 141 | 142 | 143 | 144 | 145 | 146 | 147 | 148 | 149 | 150 |
    151 | 152 | 153 | 154 | 155 | 156 | 157 | 158 | 159 | 160 | 161 | 162 | 163 | 164 | 165 | 166 | 167 | 168 | 169 | 170 | 171 | 172 | 173 | 174 | 175 |
    176 | 177 | 178 | 179 | 180 | 181 | 182 | 183 | 184 | 185 | 186 | 187 | 188 | 189 | 190 | 191 | 192 | 193 | 194 | 195 | 196 | 197 | 198 | 199 | 200 |
    201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 | 210 | 211 | 212 | 213 | 214 | 215 | 216 | 217 | 218 | 219 | 220 | 221 | 222 | 223 | 224 | 225 |
    226 | 227 | 228 | 229 | 230 | 231 | 232 | 233 | 234 | 235 | 236 | 237 | 238 | 239 | 240 | 241 | 242 | 243 | 244 | 245 | 246 | 247 | 248 | 249 | 250 |
    251 | 252 | 253 | 254 | 255;

/**
 * Valid AC mode.
 */
export declare type ACModeOptions = 'hot' | 'cold' | 'dry' | 'auto';

/**
 * Valid AC fan strength.
 */
export declare type ACFanStrengthOptions = 'low' | 'med' | 'high' | 'auto';

/**
 * Switches option
 */
export declare type SwitchOptions = 'on' | 'off';

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
 * An AC status.
 */
export declare interface AirConditioning extends Switch {
    temperature: TemperatureOptions;
    mode: ACModeOptions;
    fanStrength: ACFanStrengthOptions;
}

/**
 * A simple light status.
 * Used to devices that can chang it's brightness.
 */
export declare interface Light extends Switch {
    /**
     * Minimum 1% maximum 100% of light brightness.
     */
    brightness: PercentOptions;
}

/**
 * A light simple light status.
 * Used to devices that can chang also light temperature (warm or cold light).
 */
export declare interface TemperatureLight extends Light {
    /**
     * Spectrum is 1% to warm light and 100% to cold light.
     */
    temperature: PercentOptions;
}

/**
 * A light simple light status.
 * Used to devices that can change also light color (RGB).
 */
export declare interface ColorLight extends TemperatureLight {
    /**
     * Minimum 1 maximum 255 from red color.
     */
    red: ColorOptions;
    /**
     * Minimum 1 maximum 255 from green color.
     */
    green: ColorOptions;
    /**
     * Minimum 1 maximum 255 from blue color.
     */
    blue: ColorOptions;
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
     * For example to invoke 40 minutes before sunset set -40 and to invoke 40 minutes after sunset set 40. 
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
     */
    hour: HourInDayOptions;

    /**
     * Minutes in an hour.
     */
    minutes: MinutesInHourOptions;
}

/**
 *  Minion status, the available values depend on the minion type.
 */
export declare interface MinionStatus {
    toggle?: Toggle;
    switch?: Switch;
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