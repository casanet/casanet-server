import * as nodeYeelightWifi from 'node-yeelight-wifi';
import { Color, CommandType, DevicePropery, Discover, IDevice, Yeelight } from 'yeelight-awesome';
import {
    ColorLight,
    ColorOptions,
    DeviceKind,
    ErrorResponse,
    Light,
    Minion,
    MinionDevice,
    MinionStatus,
    MinionTypes,
    PercentOptions,
    SwitchOptions,
    TemperatureLight,
    Toggle,
} from '../../models/sharedInterfaces';
import { DeepCopy } from '../../utilities/deepCopy';
import { logger } from '../../utilities/logger';
import { Delay } from '../../utilities/sleep';
import { BrandModuleBase } from '../brandModuleBase';

export class YeelightHandler extends BrandModuleBase {

    public readonly brandName: string = 'yeelight';

    public readonly devices: DeviceKind[] = [
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: 1,
            model: 'Ceiling',
            suppotedMinionType: 'temperatureLight',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: 1,
            model: 'E27_Bulb',
            suppotedMinionType: 'colorLight',
            isRecordingSupported: false,
        },
    ];

    /** Lookup object, to look for any yeelight device update via LAN */
    private lookupYeelightWifi: any;

    constructor() {
        super();

        /** Init the yeelight look up. */
        this.lookupYeelightWifi = new nodeYeelightWifi.Lookup();

        /** Use nodeYeelightWifi lib to handle update from devices only.
         * The yeelight-awesome is for get/set data only.
         */
        this.lookupYeelightWifi.on('detected', (light) => {

            light.on('connected', () => {

            });

            light.on('disconnected', () => {

            });

            light.on('stateUpdate', async (lightUpdate) => {

                if (!this.retrieveMinions.isPullingAvailble) {
                    return;
                }

                try {
                    /** convert mac to our system pattern */
                    const deviceMac = lightUpdate.mac.replace(/:/g, '');

                    /** pull all minions in system */
                    const minions = await this.retrieveMinions.pull();

                    /** find minion that update belong to him (if exist) */
                    for (const minion of minions) {
                        if (minion.device.pysicalDevice.mac !== deviceMac) {
                            continue;
                        }

                        if (this.isMinionSameValueAsUpdate(minion, lightUpdate)) {
                            return;
                        }

                        logger.debug(`yeelight update arrived for minion ${minion.minionId}`);
                        const currentStatus = DeepCopy<MinionStatus>(minion.minionStatus);

                        const lightStatus = currentStatus[minion.minionType] as ColorLight;
                        lightStatus.status = lightUpdate.power ? 'on' : 'off';
                        lightStatus.brightness = lightUpdate.bright;

                        if (minion.minionType === 'colorLight') {

                            lightStatus.red = Math.floor(lightUpdate.rgb.r) as ColorOptions;
                            lightStatus.green = Math.floor(lightUpdate.rgb.g) as ColorOptions;
                            lightStatus.blue = Math.floor(lightUpdate.rgb.b) as ColorOptions;
                        }

                        this.minionStatusChangedEvent.next({
                            minionId: minion.minionId,
                            status: currentStatus,
                        });

                    }
                } catch (error) {

                }
            });
        });
    }

    /**
     * Create new yeelight communication device api.
     * @param minionDevice minion device property to create for.
     */
    private async createYeeligtDeviceComm(minionDevice: MinionDevice): Promise<Yeelight> {

        // return;

        const yeelight = new Yeelight({ lightIp: minionDevice.pysicalDevice.ip, lightPort: 55443 });

        /**
         * Registar to connected event.
         */
        yeelight.on('connected', () => {
            logger.debug(`yeelight device mac: ${minionDevice.pysicalDevice.mac} connected`);
        });

        yeelight.on('close', () => {
            logger.debug(`yeelight device mac: ${minionDevice.pysicalDevice.mac} close`);
        });

        yeelight.on('end', () => {
            logger.debug(`yeelight device mac: ${minionDevice.pysicalDevice.mac} end`);
        });

        yeelight.on('error', (err) => {
            logger.debug(`yeelight device mac: ${minionDevice.pysicalDevice.mac} error ${err}`);
        });

        /**
         * Establish connection
         */
        await yeelight.connect();

        return yeelight;
    }

    /**
     * Check if minion status is same as light Object update values.
     * @param minion minion to check.
     * @param lightUpdate yeelight update object to check.
     * @returns True is values is same in both.
     */
    private isMinionSameValueAsUpdate(minion: Minion, lightUpdate: any): boolean {

        const currentStatus = minion.minionStatus[minion.minionType] as ColorLight;

        if (lightUpdate.power !== (currentStatus.status === 'on')) {
            return false;
        }

        if (lightUpdate.bright !== currentStatus.brightness) {
            return false;
        }

        if (minion.minionType === 'colorLight' && (
            lightUpdate.rgb.r !== currentStatus.red ||
            lightUpdate.rgb.g !== currentStatus.green ||
            lightUpdate.rgb.b !== currentStatus.blue)) {
            return false;
        }

        return true;
    }

    /**
     * The RGB in yeelight is hold in one int var , with struct of 0x00RRGGBB
     * so every color has 256 options (16 bits === 2 bytes when byte is 8 bits)
     * @param intager intager of color.
     * @returns Color object seperated to r g and b.
     */
    private intToRgb(intager: number): { r: number, g: number, b: number } {
        let red = intager;
        for (let i = 0; i < 16; i++) {
            red = red / 2;
        }

        let green = intager;
        for (let i = 0; i < 8; i++) {
            green = green / 2;
        }
        green = green % (Math.pow(2, 8));

        let blue = intager;
        blue = blue % (Math.pow(2, 8));

        return {
            r: Math.floor(red),
            g: Math.floor(green),
            b: Math.floor(blue),
        };
    }

    /**
     * Convert percent of light temperature value to Kelvin units see https://en.wikipedia.org/wiki/Color_temperature
     * @param valueInPercents original value in range 1 - 100
     */
    private convertPercentsToLightTemp(valueInPercents: number): number {
        const minRange = 2740; // From some reason under 2700 get general error.
        const maxRange = 6500;

        const range = maxRange - minRange;
        const factor = range / 100;
        return Math.floor((valueInPercents * factor) + minRange);
    }

    /**
     * Convert Kelvin units to light temperature in percents (1-100)  see https://en.wikipedia.org/wiki/Color_temperature
     * @param valueInTempRange Original value, in K.
     */
    private convertColorTempToPercents(valueInTempRange: number): number {
        const minRange = 1700;
        const maxRange = 6500;

        const range = maxRange - minRange;
        const factor = range / 100;
        return Math.floor((valueInTempRange - minRange) / factor);
    }

    /**
     * Get yeelight light status.
     * @param minion minion to get for.
     * @param yeelightDevice yeelight object to get by.
     * @returns Current minion status
     */
    private async getSimpleLightStatus(minion: Minion, yeelightDevice: Yeelight): Promise<MinionStatus | ErrorResponse> {
        try {
            const props = await yeelightDevice.getProperty([DevicePropery.POWER, DevicePropery.BRIGHT, DevicePropery.CT]);

            return {
                temperatureLight: {
                    status: props.result.result[0],
                    temperature: this.convertColorTempToPercents(parseInt(props.result.result[2], 10)) as PercentOptions,
                    brightness: parseInt(props.result.result[1], 10) as PercentOptions,
                },
            };
        } catch (error) {
            logger.warn(`Fail to get yeeligt ${minion.minionId} status, ${error.result.error.message}`);
            throw {
                responseCode: 6503,
            } as ErrorResponse;
        }
    }

    /**
     * Get yeelight color light status.
     * @param minion minion to get for.
     * @param yeelightDevice yeelight object to get by.
     * @returns Current minion status
     */
    private async getColorLightStatus(minion: Minion, yeelightDevice: Yeelight): Promise<MinionStatus | ErrorResponse> {
        try {
            const props =
                await yeelightDevice.getProperty([DevicePropery.POWER, DevicePropery.BRIGHT, DevicePropery.CT, DevicePropery.RGB]);

            const rgb = this.intToRgb(parseInt(props.result.result[3], 10));

            return {
                colorLight: {
                    status: props.result.result[0],
                    temperature: this.convertColorTempToPercents(parseInt(props.result.result[2], 10)) as PercentOptions,
                    brightness: parseInt(props.result.result[1], 10) as PercentOptions,
                    red: rgb.r as ColorOptions,
                    green: rgb.g as ColorOptions,
                    blue: rgb.b as ColorOptions,
                },
            };
        } catch (error) {
            logger.warn(`Fail to get yeeligt ${minion.minionId} status, ${error.result.error.message}`);
            throw {
                responseCode: 7503,
            } as ErrorResponse;
        }
    }

    /** Set yeelight on/off oprtion */
    private async setPower(yeelightDevice: Yeelight, setState: SwitchOptions) {
        await yeelightDevice.setPower(setState === 'on', 'smooth', 1000);
    }

    /** Set yeelight temperature (col/warn light) */
    private async setTemperature(yeelightDevice: Yeelight, setTemperatureLight: PercentOptions) {
        await yeelightDevice.setCtAbx(this.convertPercentsToLightTemp(setTemperatureLight), 'smooth', 1000);
    }

    /** Set yeelight light brightness (1-100) */
    private async setBrightness(yeelightDevice: Yeelight, setBrightness: PercentOptions) {
        await yeelightDevice.setBright(setBrightness, 'smooth', 1000);
    }

    /** Set yeelight RGB color  */
    private async setColor(yeelightDevice: Yeelight, setColor: ColorLight) {
        await yeelightDevice.setRGB(new Color(setColor.red, setColor.green, setColor.blue), 'smooth', 5000);
    }

    /** Set light properties to simple yeelight light device */
    private async setSimpleLightStatus(minion: Minion, yeelightDevice: Yeelight, setTemperatureLight: TemperatureLight):
        Promise<ErrorResponse> {
        try {

            await this.setPower(yeelightDevice, setTemperatureLight.status);

            await this.setBrightness(yeelightDevice, setTemperatureLight.brightness);

            await this.setTemperature(yeelightDevice, setTemperatureLight.temperature);

            return;
        } catch (error) {
            logger.warn(`Fail to set yeeligt ${minion.minionId} status, ${error.result.error.message}`);
            throw {
                responseCode: 7503,
            } as ErrorResponse;
        }
    }

    /** Set light properties to color RGB light support */
    private async setColorLightStatus(minion: Minion, yeelightDevice: Yeelight, setColorLight: ColorLight)
        : Promise<ErrorResponse> {
        try {
            const currentStatus = minion.minionStatus.colorLight;

            await this.setPower(yeelightDevice, setColorLight.status);

            await this.setBrightness(yeelightDevice, setColorLight.brightness);

            /** If the temp changed, do not set RGB otherways the ligt will b colored ;) */
            if (currentStatus.temperature !== setColorLight.temperature) {
                await this.setTemperature(yeelightDevice, setColorLight.temperature);
            } else {
                await this.setColor(yeelightDevice, setColorLight);
            }

            return;
        } catch (error) {
            logger.warn(`Fail to set yeeligt ${minion.minionId} status, ${error.result.error.message}`);
            throw {
                responseCode: 6503,
            } as ErrorResponse;
        }
    }

    public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {

        try {

            const l = await this.createYeeligtDeviceComm(minion.device);

            let status: MinionStatus;
            switch (minion.minionType) {
                case 'temperatureLight':
                    status = await this.getSimpleLightStatus(minion, l) as MinionStatus;
                    break;
                case 'colorLight':
                    status = await this.getColorLightStatus(minion, l) as MinionStatus;
                    break;
                default:
            }

            l.disconnect();

            return status;
        } catch (error) {

            try { error = error.result.error.message; } catch (error) { }
            logger.warn(`Fail to get yeeligt ${minion.minionId} status, ${error}`);
            throw {
                responseCode: 7503,
            } as ErrorResponse;
        }
    }

    public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        try {

            const l = await this.createYeeligtDeviceComm(minion.device);

            switch (minion.minionType) {
                case 'temperatureLight':
                    await this.setSimpleLightStatus(minion, l, setStatus.temperatureLight);
                    break;
                case 'colorLight':
                    await this.setColorLightStatus(minion, l, setStatus.colorLight);
                    break;
                default:
            }

            l.disconnect();

            return;
        } catch (error) {
            logger.warn(`Fail to set yeelight ${minion.minionId} status, ${error.result.error.message}`);
            throw {
                responseCode: 6503,
            } as ErrorResponse;
        }
    }

    public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        throw {
            responseCode: 6409,
            message: 'the yeelight module not support any recording mode',
        } as ErrorResponse;
    }
}
