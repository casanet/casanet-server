import * as  moment from 'moment';
import * as Orvibo from 'node-orvibo';
import {
    DeviceKind,
    ErrorResponse,
    Minion,
    MinionStatus,
} from '../../models/sharedInterfaces';
import { logger } from '../../utilities/logger';
import { Delay } from '../../utilities/sleep';
import { BrandModuleBase } from '../brandModuleBase';

export class OrviboHandler extends BrandModuleBase {

    public readonly brandName: string = 'orvibo';

    public readonly devices: DeviceKind[] = [
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: 1,
            model: 'S20',
            suppotedMinionType: 'switch',
            isRecordingSupported: false,
        },
    ];

    private orviboCommunication: any;
    private queryCallback: (deviceResult: any) => void;

    constructor() {
        super();

        try {
            this.initOrviboCommunication();
        } catch (error) {
            this.orviboCommunication = undefined;
            logger.error('Fail to init orvibo communication');
        }
    }

    /** Init connection (UDP socket) for orvibo,
     * and listen to broadcasts messags in LAN
     */
    private initOrviboCommunication() {
        /** Create the orvibo protocol instance */
        this.orviboCommunication = new Orvibo();

        /** open the needs UDP channel */
        this.orviboCommunication.listen();

        /** listen to any device status changes arrived */
        this.orviboCommunication.on('externalstatechanged', async (changedDevice) => {
            if (this.queryCallback) {
                this.queryCallback(changedDevice);
            }

            if (!this.retrieveMinions.isPullingAvailble) {
                return;
            }

            const minions = await this.retrieveMinions.pull();

            for (const minion of minions) {
                if (minion.device.pysicalDevice.mac === changedDevice.macAddress) {
                    this.minionStatusChangedEvent.next({
                        minionId: minion.minionId,
                        status: {
                            switch: {
                                status: changedDevice.state ? 'on' : 'off',
                            },
                        },
                    });
                }
            }
        });

        /** Registar to query data response arrived */
        this.orviboCommunication.on('queried', async (queriedDevice) => {
            if (this.queryCallback) {
                this.queryCallback(queriedDevice);
            }
        });
    }

    /**
     * Prepare the orvibo device, in first use. (once to each devices)
     * @param miniom The minion of device.
     */
    private async prepareOrviboSending(miniom: Minion) {
        /** If there is no connection, try to init it */
        if (!this.orviboCommunication) {
            try {
                this.initOrviboCommunication();
            } catch (error) {
                this.orviboCommunication = undefined;
                throw {
                    responseCode: 5001,
                    message: 'there is no UDP socket to send request by',
                } as ErrorResponse;
            }
        }

        /** Reload device each time befor sending data using UDP */
        if (this.orviboCommunication.getDevice(miniom.device.pysicalDevice.mac)) {
            this.orviboCommunication.devices = [];
        }

        /** Create device object */
        const orvibo = {
            macAddress: miniom.device.pysicalDevice.mac,
            macPadding: '202020202020',
            type: 'Socket',
            ip: miniom.device.pysicalDevice.ip,
            // Takes the last character from the message and turns it into a boolean.
            // This is our socket's initial state
            state: false,
        };

        /** Add it to lib collection */
        this.orviboCommunication.addDevice(orvibo);

        /** Tell lib to subscribe device events results */
        this.orviboCommunication.subscribe(orvibo);

        /** Let UDP to be sent */
        await Delay(moment.duration(0.5, 'seconds'));
    }

    public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {

        await this.prepareOrviboSending(minion);

        return new Promise<MinionStatus>((resolve, reject) => {
            /** create the query message */
            const message = this.orviboCommunication.prepareMessage({
                commandID: '7274',
                macAddress: minion.device.pysicalDevice.mac,
                macPadding: '202020202020',
                data: {
                    blank: '00000000',
                    // There are two tables we're interested in,
                    // Table 04 is neat info about the device, Table 03
                    // is timing data (e.g. turn socket on at 8pm etc.)
                    table: '04',
                    blank2: '000000000000',
                },
            });

            /** send query message to device */
            this.orviboCommunication.sendMessage(message, minion.device.pysicalDevice.ip);

            /** create timeout, case device not responsing */
            const timeoutTimer = setTimeout(() => {
                this.queryCallback = undefined;
                logger.warn(`Fail to get orvibo device ${minion.minionId} state, timeout`);
                reject({
                    responseCode: 5001,
                } as ErrorResponse);
            }, moment.duration(5, 'seconds').asMilliseconds());

            /** set callback to query event */
            this.queryCallback = (deviceResult) => {
                if (deviceResult.macAddress !== minion.device.pysicalDevice.mac) {
                    return;
                }

                this.queryCallback = undefined;
                clearTimeout(timeoutTimer);

                resolve({
                    switch: {
                        status: deviceResult.state ? 'on' : 'off',
                    },
                });
            };
        });
    }

    public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {

        await this.prepareOrviboSending(minion);

        return new Promise((resolve, reject) => {

            /** Create set status message */
            const message = this.orviboCommunication.prepareMessage({
                commandID: '6463',
                macAddress: minion.device.pysicalDevice.mac,
                macPadding: '202020202020',
                data: {
                    // Session ID?
                    blank: '00000000',
                    // Ternary operators are cool, but hard to read.
                    // This one says "if state is true, set state to 01, otherwise, set to 00"
                    state: setStatus.switch.status === 'on' ? '01' : '00',
                },
            });

            /** Send status message to device */
            this.orviboCommunication.sendMessage(message, minion.device.pysicalDevice.ip);

            /** create timeout, case device not responsing */
            const timeoutTimer = setTimeout(() => {
                this.queryCallback = undefined;
                logger.warn(`Fail to set orvibo device ${minion.minionId} ${setStatus.switch.status} state, timeout`);
                reject({
                    responseCode: 5001,
                } as ErrorResponse);
            }, moment.duration(5, 'seconds').asMilliseconds());

            /** set callback to query event */
            this.queryCallback = (deviceResult) => {
                if (deviceResult.macAddress !== minion.device.pysicalDevice.mac) {
                    return;
                }

                this.queryCallback = undefined;
                clearTimeout(timeoutTimer);

                if (setStatus.switch.status === (deviceResult.state ? 'on' : 'off')) {
                    resolve();
                    return;
                }

                reject({
                    responseCode: 5001,
                    message: 'fail to set device status',
                } as ErrorResponse);
            };
        });
    }

    public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        throw {
            responseCode: 5010,
            message: 'the orvibo module not support any recording mode',
        } as ErrorResponse;
    }
}
