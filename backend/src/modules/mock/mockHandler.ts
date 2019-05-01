import * as moment from 'moment';
import { Duration } from 'moment';
import { BehaviorSubject } from 'rxjs';
import { DeviceKind, ErrorResponse, Minion, MinionStatus, SwitchOptions, Toggle } from '../../models/sharedInterfaces';
import { DeepCopy } from '../../utilities/deepCopy';
import { Delay } from '../../utilities/sleep';
import { BrandModuleBase } from '../brandModuleBase';

export class MockHandler extends BrandModuleBase {

    /**
     * Time duratin to mock pysical device status update for switch minion.
     */
    private readonly SWITCH_CHANGED_INTERVAL: Duration = moment.duration(4, 'seconds');

    /**
     * Time duratin to mock pysical device status update for ac minion.
     */
    private readonly AC_CHANGED_INTERVAL: Duration = moment.duration(5, 'seconds');

    public readonly brandName: string = 'mock';

    public readonly devices: DeviceKind[] = [
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: 1,
            model: 'switch demo',
            suppotedMinionType: 'switch',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'ac demo',
            suppotedMinionType: 'airConditioning',
            isRecordingSupported: true,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'RF toggle demo',
            suppotedMinionType: 'toggle',
            isRecordingSupported: true,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'Light demo',
            suppotedMinionType: 'light',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'Temperature Light demo',
            suppotedMinionType: 'temperatureLight',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'Color Light demo',
            suppotedMinionType: 'colorLight',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'Roller demo',
            suppotedMinionType: 'roller',
            isRecordingSupported: false,
        },
    ];

    constructor() {

        super();

        // for debug updattes remove 'return'
        return;
        setInterval(async () => {

            const minions = await this.retrieveMinions.pull();

            if (minions.length === 0
                || !minions[0].minionStatus
                || !minions[0].minionStatus[minions[0].minionType]) {
                return;
            }

            const statusCopy = DeepCopy<MinionStatus>(minions[0].minionStatus);

            const statusObject = statusCopy[minions[0].minionType] as Toggle;
            statusObject.status = statusObject.status === 'off' ? 'on' : 'off';

            this.minionStatusChangedEvent.next({
                minionId: minions[0].minionId,
                status: statusCopy,
            });
        }, this.SWITCH_CHANGED_INTERVAL.asMilliseconds());

        setInterval(() => {
            this.minionStatusChangedEvent.next({
                minionId: '656565656',
                status: {
                    airConditioning: {
                        status: 'off',
                        fanStrength: 'high',
                        mode: 'cold',
                        temperature: 20,
                    },
                },
            });
        }, this.AC_CHANGED_INTERVAL.asMilliseconds());

    }
    public async getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
        await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.

        switch (miniom.device.model) {
            case 'switch demo':
                return {
                    switch: {
                        status: 'on',
                    },
                };
            case 'ac demo':
                return {
                    airConditioning: {
                        fanStrength: 'med',
                        mode: 'cold',
                        status: 'on',
                        temperature: 21,
                    },
                };
            case 'Light demo':
                return {
                    light: {
                        brightness: 50,
                        status: 'on',
                    },
                };
            case 'Temperature Light demo':
                return {
                    temperatureLight: {
                        brightness: 50,
                        status: 'on',
                        temperature: 85,
                    },
                };
            case 'Color Light demo':
                return {
                    colorLight: {
                        brightness: 50,
                        status: 'on',
                        temperature: 85,
                        blue: 120,
                        green: 123,
                        red: 143,
                    },
                };
            case 'Roller demo':
                return {
                    roller: {
                        status: 'on',
                        direction: 'up',
                    },
                };
        }

        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        } as ErrorResponse;
    }

    public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.
        if (miniom.device.model === 'switch demo' ||
            miniom.device.model === 'ac demo' ||
            miniom.device.model === 'RF toggle demo' ||
            miniom.device.model === 'Roller demo' ||
            miniom.device.model === 'Light demo' ||
            miniom.device.model === 'Temperature Light demo' ||
            miniom.device.model === 'Color Light demo') {
            return;
        }

        throw {
            responseCode: 8404,
            message: 'unknown minion model',
        } as ErrorResponse;
    }

    public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.
    }

    public async generateCommand(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real command generation.
    }

    public async refreshCommunication(): Promise<void> {
        // There's nothing to do.
    }
}
