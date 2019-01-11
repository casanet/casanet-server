import * as moment from 'moment';
import { Duration } from 'moment';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { IMinionsBrandModule } from '../../models/backendInterfaces';
import { DeviceKind, ErrorResponse, Minion, MinionStatus } from '../../models/sharedInterfaces';
import { Delay } from '../../utilities/sleep';

export class MockHandler implements IMinionsBrandModule {

    /**
     * Time duratin to mock pysical device status update for switch minion.
     */
    private readonly SWITCH_CHANGED_INTERVAL: Duration = moment.duration(2, 'seconds');

    /**
     * Time duratin to mock pysical device status update for ac minion.
     */
    private readonly AC_CHANGED_INTERVAL: Duration = moment.duration(5, 'seconds');

    public readonly brandName: string = 'mock';

    public readonly devices: DeviceKind[] = [
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isUsedAsLogicDevice: false,
            model: 'switch demo',
            suppotedMinionType: 'switch',
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isUsedAsLogicDevice: true,
            model: 'ac demo',
            suppotedMinionType: 'airConditioning',
        },
    ];

    public minionStatusChangedEvent = new BehaviorSubject<{
        mac: string;
        status: MinionStatus;
    }>({
        mac: '',
        status: undefined,
    });

    constructor() {

        setInterval(() => {
            this.minionStatusChangedEvent.next({
                mac: '4343434343',
                status: {
                    switch: {
                        status: 'on',
                    },
                },
            });
        }, this.SWITCH_CHANGED_INTERVAL.asMilliseconds());

        setInterval(() => {
            this.minionStatusChangedEvent.next({
                mac: '656565656',
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
        if (miniom.device.model === 'switch demo') {
            return {
                switch: {
                    status: 'on',
                },
            };
        } else if (miniom.device.model === 'ac demo') {
            return {
                airConditioning: {
                    fanStrength: 'med',
                    mode: 'cold',
                    status: 'on',
                    temperature: 21,
                },
            };
        }
        throw {
            responseCode: 4005,
            message: 'unknown model',
        } as ErrorResponse;
    }

    public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.
        if (miniom.device.model === 'switch demo' ||
            miniom.device.model === 'ac demo') {
            return;
        }

        throw {
            responseCode: 4005,
            message: 'unknown model',
        } as ErrorResponse;
    }
}
