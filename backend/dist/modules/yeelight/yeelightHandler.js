"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodeYeelightWifi = require("node-yeelight-wifi");
const yeelight_awesome_1 = require("yeelight-awesome");
const deepCopy_1 = require("../../utilities/deepCopy");
const logger_1 = require("../../utilities/logger");
const brandModuleBase_1 = require("../brandModuleBase");
class YeelightHandler extends brandModuleBase_1.BrandModuleBase {
    constructor() {
        super();
        this.brandName = 'yeelight';
        this.devices = [
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: false,
                minionsPerDevice: 1,
                model: 'Temperature light',
                suppotedMinionType: 'temperatureLight',
                isRecordingSupported: false,
            },
            {
                brand: this.brandName,
                isTokenRequierd: false,
                isIdRequierd: false,
                minionsPerDevice: 1,
                model: 'RGBW light',
                suppotedMinionType: 'colorLight',
                isRecordingSupported: false,
            },
        ];
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
                        logger_1.logger.debug(`yeelight update arrived for minion ${minion.minionId}`);
                        const currentStatus = deepCopy_1.DeepCopy(minion.minionStatus);
                        const lightStatus = currentStatus[minion.minionType];
                        lightStatus.status = lightUpdate.power ? 'on' : 'off';
                        lightStatus.brightness = lightUpdate.bright;
                        if (minion.minionType === 'colorLight') {
                            lightStatus.red = Math.floor(lightUpdate.rgb.r);
                            lightStatus.green = Math.floor(lightUpdate.rgb.g);
                            lightStatus.blue = Math.floor(lightUpdate.rgb.b);
                        }
                        this.minionStatusChangedEvent.next({
                            minionId: minion.minionId,
                            status: currentStatus,
                        });
                    }
                }
                catch (error) {
                }
            });
        });
    }
    /**
     * Create new yeelight communication device api.
     * @param minionDevice minion device property to create for.
     */
    async createYeeligtDeviceComm(minionDevice) {
        // return;
        const yeelight = new yeelight_awesome_1.Yeelight({ lightIp: minionDevice.pysicalDevice.ip, lightPort: 55443 });
        /**
         * Registar to connected event.
         */
        yeelight.on('connected', () => {
            logger_1.logger.debug(`yeelight device mac: ${minionDevice.pysicalDevice.mac} connected`);
        });
        yeelight.on('close', () => {
            logger_1.logger.debug(`yeelight device mac: ${minionDevice.pysicalDevice.mac} close`);
        });
        yeelight.on('end', () => {
            logger_1.logger.debug(`yeelight device mac: ${minionDevice.pysicalDevice.mac} end`);
        });
        yeelight.on('error', (err) => {
            logger_1.logger.debug(`yeelight device mac: ${minionDevice.pysicalDevice.mac} error ${err}`);
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
    isMinionSameValueAsUpdate(minion, lightUpdate) {
        const currentStatus = minion.minionStatus[minion.minionType];
        if (lightUpdate.power !== (currentStatus.status === 'on')) {
            return false;
        }
        if (lightUpdate.bright !== currentStatus.brightness) {
            return false;
        }
        if (minion.minionType === 'colorLight' && (lightUpdate.rgb.r !== currentStatus.red ||
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
    intToRgb(intager) {
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
    convertPercentsToLightTemp(valueInPercents) {
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
    convertColorTempToPercents(valueInTempRange) {
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
    async getSimpleLightStatus(minion, yeelightDevice) {
        try {
            const props = await yeelightDevice.getProperty([yeelight_awesome_1.DevicePropery.POWER, yeelight_awesome_1.DevicePropery.BRIGHT, yeelight_awesome_1.DevicePropery.CT]);
            return {
                temperatureLight: {
                    status: props.result.result[0],
                    temperature: this.convertColorTempToPercents(parseInt(props.result.result[2], 10)),
                    brightness: parseInt(props.result.result[1], 10),
                },
            };
        }
        catch (error) {
            logger_1.logger.warn(`Fail to get yeeligt ${minion.minionId} status, ${error.result.error.message}`);
            throw {
                responseCode: 6503,
            };
        }
    }
    /**
     * Get yeelight color light status.
     * @param minion minion to get for.
     * @param yeelightDevice yeelight object to get by.
     * @returns Current minion status
     */
    async getColorLightStatus(minion, yeelightDevice) {
        try {
            const props = await yeelightDevice.getProperty([yeelight_awesome_1.DevicePropery.POWER, yeelight_awesome_1.DevicePropery.BRIGHT, yeelight_awesome_1.DevicePropery.CT, yeelight_awesome_1.DevicePropery.RGB]);
            const rgb = this.intToRgb(parseInt(props.result.result[3], 10));
            return {
                colorLight: {
                    status: props.result.result[0],
                    temperature: this.convertColorTempToPercents(parseInt(props.result.result[2], 10)),
                    brightness: parseInt(props.result.result[1], 10),
                    red: rgb.r,
                    green: rgb.g,
                    blue: rgb.b,
                },
            };
        }
        catch (error) {
            logger_1.logger.warn(`Fail to get yeeligt ${minion.minionId} status, ${error.result.error.message}`);
            throw {
                responseCode: 7503,
            };
        }
    }
    /** Set yeelight on/off oprtion */
    async setPower(yeelightDevice, setState) {
        await yeelightDevice.setPower(setState === 'on', 'smooth', 1000);
    }
    /** Set yeelight temperature (col/warn light) */
    async setTemperature(yeelightDevice, setTemperatureLight) {
        await yeelightDevice.setCtAbx(this.convertPercentsToLightTemp(setTemperatureLight), 'smooth', 1000);
    }
    /** Set yeelight light brightness (1-100) */
    async setBrightness(yeelightDevice, setBrightness) {
        await yeelightDevice.setBright(setBrightness, 'smooth', 1000);
    }
    /** Set yeelight RGB color  */
    async setColor(yeelightDevice, setColor) {
        await yeelightDevice.setRGB(new yeelight_awesome_1.Color(setColor.red, setColor.green, setColor.blue), 'smooth', 5000);
    }
    /** Set light properties to simple yeelight light device */
    async setSimpleLightStatus(minion, yeelightDevice, setTemperatureLight) {
        try {
            await this.setPower(yeelightDevice, setTemperatureLight.status);
            await this.setBrightness(yeelightDevice, setTemperatureLight.brightness);
            await this.setTemperature(yeelightDevice, setTemperatureLight.temperature);
            return;
        }
        catch (error) {
            logger_1.logger.warn(`Fail to set yeeligt ${minion.minionId} status, ${error.result.error.message}`);
            throw {
                responseCode: 7503,
            };
        }
    }
    /** Set light properties to color RGB light support */
    async setColorLightStatus(minion, yeelightDevice, setColorLight) {
        try {
            const currentStatus = minion.minionStatus.colorLight;
            await this.setPower(yeelightDevice, setColorLight.status);
            await this.setBrightness(yeelightDevice, setColorLight.brightness);
            /** If the temp changed, do not set RGB otherways the ligt will b colored ;) */
            if (currentStatus.temperature !== setColorLight.temperature) {
                await this.setTemperature(yeelightDevice, setColorLight.temperature);
            }
            else {
                await this.setColor(yeelightDevice, setColorLight);
            }
            return;
        }
        catch (error) {
            logger_1.logger.warn(`Fail to set yeeligt ${minion.minionId} status, ${error.result.error.message}`);
            throw {
                responseCode: 6503,
            };
        }
    }
    async getStatus(minion) {
        try {
            const l = await this.createYeeligtDeviceComm(minion.device);
            let status;
            switch (minion.minionType) {
                case 'temperatureLight':
                    status = await this.getSimpleLightStatus(minion, l);
                    break;
                case 'colorLight':
                    status = await this.getColorLightStatus(minion, l);
                    break;
                default:
            }
            l.disconnect();
            return status;
        }
        catch (error) {
            try {
                error = error.result.error.message;
            }
            catch (error) { }
            logger_1.logger.warn(`Fail to get yeeligt ${minion.minionId} status, ${error}`);
            throw {
                responseCode: 7503,
            };
        }
    }
    async setStatus(minion, setStatus) {
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
        }
        catch (error) {
            logger_1.logger.warn(`Fail to set yeelight ${minion.minionId} status, ${error.result.error.message}`);
            throw {
                responseCode: 6503,
            };
        }
    }
    async enterRecordMode(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the yeelight module not support any recording mode',
        };
    }
    async generateCommand(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the yeelight module not support any recording mode',
        };
    }
    async setFetchedCommands(minion, commandsSet) {
        // There's nothing to do.
    }
    async refreshCommunication() {
        // There's nothing to do.
    }
}
exports.YeelightHandler = YeelightHandler;
//# sourceMappingURL=yeelightHandler.js.map