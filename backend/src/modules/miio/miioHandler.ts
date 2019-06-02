import * as miio from 'miio';
import { BehaviorSubject } from 'rxjs';
import {
    Cleaner,
    CleanerMode,
    DeviceKind,
    ErrorResponse,
    FanStrengthOptions,
    Minion,
    MinionDevice,
    MinionStatus,
    SwitchOptions,
    TemperatureLight,
} from '../../models/sharedInterfaces';
import { DeepCopy } from '../../utilities/deepCopy';
import { logger } from '../../utilities/logger';
import { BrandModuleBase } from '../brandModuleBase';

export class MiioHandler extends BrandModuleBase {

    public readonly brandName: string = 'miio';

    public readonly devices: DeviceKind[] = [
        {
            brand: this.brandName,
            isTokenRequierd: true,
            isIdRequierd: false,
            minionsPerDevice: 1,
            model: 'Robot vacuum',
            suppotedMinionType: 'cleaner',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: true,
            isIdRequierd: false,
            minionsPerDevice: 1,
            model: 'Philips ceiling',
            suppotedMinionType: 'temperatureLight',
            isRecordingSupported: false,
        },
    ];

    /**
     * Map devices by mac address
     */
    private pysicalDevicesMap: { [key: string]: miio.device } = {};

    constructor() {
        super();
    }

    private async getMiioDevice(minionDevice: MinionDevice): Promise<miio.device> {

        if (this.pysicalDevicesMap[minionDevice.pysicalDevice.mac]) {
            return this.pysicalDevicesMap[minionDevice.pysicalDevice.mac];
        }

        const device = await miio.device({ address: minionDevice.pysicalDevice.ip, token: minionDevice.token });

        this.pysicalDevicesMap[minionDevice.pysicalDevice.mac] = device;

        return device;
    }

    private async getFanSpeed(device: miio.device): Promise<FanStrengthOptions> {
        const rawSpeed = await device.fanSpeed();

        switch (rawSpeed) {
            case 38: return 'low';
            case 60: return 'med';
            case 77: return 'high';
        }
        return 'auto';
    }

    private async setFanSpeed(device: miio.device, fanStrengt: FanStrengthOptions) {
        let rawSpeed = 60;

        switch (fanStrengt) {
            case 'low': rawSpeed = 38; break;
            case 'med': rawSpeed = 60; break;
            case 'high': rawSpeed = 77; break;
        }
        await device.call('set_custom_mode', [rawSpeed]);

    }

    private async setVaccumStatus(device: miio.device, setStatus: Cleaner) {
        if (setStatus.status === 'off') {
            await await device.call('app_pause');
            return;
        }

        await this.setFanSpeed(device, setStatus.fanSpeed);

        switch (setStatus.mode) {
            case 'clean': await await device.call('app_start'); break;
            case 'dock': await device.call('app_charge'); break;
        }
    }

    private async getVaccumStatus(device: miio.device): Promise<Cleaner> {
        const statuses = (await device.call('get_status'))[0];

        const status: SwitchOptions = statuses.in_cleaning ? 'on' : 'off';

        const fanSpeed = await this.getFanSpeed(device);

        /** 8 == charging, 6 == going to the dock */
        const mode: CleanerMode = statuses.state === 8 || statuses.state === 6
            ? 'dock'
            : 'clean';
        return {
            fanSpeed,
            mode,
            status,
        };
    }

    private async setTempLightStatus(device: miio.device, setStatus: TemperatureLight) {
        await device.call('set_power', [setStatus.status]);
        if (setStatus.status === 'on') {
            await device.call('set_bricct', [setStatus.brightness, setStatus.temperature]);
        }
    }

    private async getTempLightStatus(device: miio.device): Promise<TemperatureLight> {
        const status = (await device.call('get_prop', ['power']))[0];
        const brightness = (await device.call('get_prop', ['bright']))[0];
        const temperature = (await device.call('get_prop', ['cct']))[0];
        return {
            temperature,
            brightness,
            status,
        };
    }
    public async getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {

        try {

            const device = await this.getMiioDevice(miniom.device);
            switch (miniom.minionType) {
                case 'cleaner':
                    return {
                        cleaner: await this.getVaccumStatus(device),
                    };
                case 'temperatureLight':
                    return {
                        temperatureLight: await this.getTempLightStatus(device),
                    };
            }

            throw {
                responseCode: 8404,
                message: 'unknown minion model',
            } as ErrorResponse;

        } catch (error) {

            throw {
                responseCode: 1503,
                message: 'communication with miio device fail',
            } as ErrorResponse;
        }
    }

    public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        try {
            const device = await this.getMiioDevice(miniom.device);

            switch (miniom.minionType) {
                case 'cleaner':
                    return await this.setVaccumStatus(device, setStatus.cleaner);
                case 'temperatureLight':
                    return await this.setTempLightStatus(device, setStatus.temperatureLight);
            }

            throw {
                responseCode: 8404,
                message: 'unknown minion model',
            } as ErrorResponse;

        } catch (error) {

            throw {
                responseCode: 1503,
                message: 'communication with miio device fail',
            } as ErrorResponse;
        }
    }

    public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        throw {
            responseCode: 6409,
            message: 'the miio module not support any recording mode',
        } as ErrorResponse;
    }

    public async generateCommand(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        throw {
            responseCode: 6409,
            message: 'the miio module not support any recording mode',
        } as ErrorResponse;
    }

    public async refreshCommunication(): Promise<void> {
        for (const miioDevice of Object.values(this.pysicalDevicesMap)) {
            miioDevice.destroy();
        }
        this.pysicalDevicesMap = {};
    }
}
