import * as moment from 'moment';
import { Duration } from 'moment';
import * as request from 'request-promise';
import { BehaviorSubject } from 'rxjs';
import { DeviceKind, ErrorResponse, Minion, MinionStatus, SwitchOptions, Toggle } from '../../models/sharedInterfaces';
import { DeepCopy } from '../../utilities/deepCopy';
import { logger } from '../../utilities/logger';
import { BrandModuleBase } from '../brandModuleBase';

export class IftttHandler extends BrandModuleBase {

    public readonly brandName: string = 'ifttt';

    public readonly devices: DeviceKind[] = [
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: true,
            minionsPerDevice: -1,
            model: 'toggle',
            suppotedMinionType: 'toggle',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: true,
            minionsPerDevice: -1,
            model: 'switch',
            suppotedMinionType: 'switch',
            isRecordingSupported: false,
        },
    ];

    constructor() {
        super();
    }

    public async getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
        /** Currently there is no API to get the real current status. */
        return miniom.minionStatus;
    }

    public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        try {
            // tslint:disable-next-line:max-line-length
            await request(`https://maker.ifttt.com/trigger/${miniom.minionId}-${setStatus[miniom.minionType].status}/with/key/${miniom.device.deviceId}`);
        } catch (error) {
            logger.warn(`Sent IFTTT trigger for ${miniom.minionId} fail, ${JSON.stringify(error.message)}`);
            throw {
                responseCode: 7409,
                message: 'Ifttt triggger fail.',
            } as ErrorResponse;
        }
    }

    public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        throw {
            responseCode: 6409,
            message: 'the ifttt module not support any recording mode',
        } as ErrorResponse;
    }

    public async generateCommand(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        throw {
            responseCode: 6409,
            message: 'the ifttt module not support any recording mode',
        } as ErrorResponse;
    }

    public async refreshCommunication(): Promise<void> {
        // There's nothing to do.
    }
}
