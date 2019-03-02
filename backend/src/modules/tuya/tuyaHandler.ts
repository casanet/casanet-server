import * as Tuyapi from 'tuyapi';
import { DeviceKind, ErrorResponse, Minion, MinionDevice, MinionStatus, SwitchOptions, Toggle } from '../../models/sharedInterfaces';
import { logger } from '../../utilities/logger';
import { BrandModuleBase } from '../brandModuleBase';

export class TuyaHandler extends BrandModuleBase {

    public readonly brandName: string = 'tuya';

    public readonly devices: DeviceKind[] = [
        {
            brand: this.brandName,
            isTokenRequierd: true,
            isIdRequierd: true,
            minionsPerDevice: 3,
            model: 'wall switch, 3 gangs, first one',
            suppotedMinionType: 'switch',
            isRecordingSupported : false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: true,
            isIdRequierd: true,
            minionsPerDevice: 3,
            model: 'wall switch, 3 gangs, second one',
            suppotedMinionType: 'switch',
            isRecordingSupported : false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: true,
            isIdRequierd: true,
            minionsPerDevice: 3,
            model: 'wall switch, 3 gangs, third one',
            suppotedMinionType: 'switch',
            isRecordingSupported : false,
        },
    ];

    /**
     * Map devices by mac address
     */
    private pysicalDevicesMap: { [key: string]: any } = {};

    constructor() {
        super();
    }

    /**
     * Create new tuya communication device api.
     * and also listen to data arrived from device.
     * @param minionDevice minion device property to create for.
     */
    private createTuyaDevice(minionDevice: MinionDevice): void {

        /**
         * Create tuya device.
         */
        const tuyaDevice = new Tuyapi({
            id: minionDevice.deviceId,
            key: minionDevice.token,
            ip: minionDevice.pysicalDevice.ip,
            persistentConnection: true,
        });

        /**
         * Registar to connected event.
         */
        tuyaDevice.on('connected', () => {
            logger.debug(`tuya device mac: ${minionDevice.pysicalDevice.mac} connected`);
        });
        /**
         * Registar to disconnected event.
         */
        tuyaDevice.on('disconnected', () => {
            logger.debug(`tuya device mac: ${minionDevice.pysicalDevice.mac} disconnected`);
        });

        /**
         * Registar to status changed event.
         */
        tuyaDevice.on('data', (data) => {
            logger.debug(`tuya device mac: ${minionDevice.pysicalDevice.mac} data arrived`);

            /**
             * Get the current status (the 'data' paramerer is invalid)
             */
            tuyaDevice.get({ schema: true }).then((status) => {
                /**
                 * Pull the current minions array in system.
                 */
                this.retrieveMinions.pull()
                    .then((minions) => {
                        for (const minion of minions) {
                            /**
                             * Find the minions that used current pysical tuya device
                             */
                            if (minion.device.deviceId !== minionDevice.deviceId) {
                                continue;
                            }

                            /**
                             * Then read the current status for specific model and
                             * send new status update to all subsribers.
                             */
                            if (minion.device.model === 'wall switch, 3 gangs, first one') {
                                this.minionStatusChangedEvent.next({
                                    minionId: minion.minionId,
                                    status: {
                                        switch: {
                                            status: status.dps['1'] ? 'on' : 'off',
                                        },
                                    },
                                });
                            }

                            if (minion.device.model === 'wall switch, 3 gangs, second one') {
                                this.minionStatusChangedEvent.next({
                                    minionId: minion.minionId,
                                    status: {
                                        switch: {
                                            status: status.dps['2'] ? 'on' : 'off',
                                        },
                                    },
                                });
                            }

                            if (minion.device.model === 'wall switch, 3 gangs, third one') {
                                this.minionStatusChangedEvent.next({
                                    minionId: minion.minionId,
                                    status: {
                                        switch: {
                                            status: status.dps['3'] ? 'on' : 'off',
                                        },
                                    },
                                });
                            }
                        }
                    });
            });
        });

        /**
         * Registar to error event.
         */
        tuyaDevice.on('error', (err) => {
            logger.debug(`tuya device mac: ${minionDevice.pysicalDevice.mac} error: ${err}`);
        });

        /**
         * Establish connection
         */
        tuyaDevice.connect();

        /**
         * Save the device API in map. to allow instance useing.
         */
        this.pysicalDevicesMap[minionDevice.pysicalDevice.mac] = tuyaDevice;
    }

    /**
     * Get tuya device API instance.
     * @param minionDevice The minion device property. to get tuya instance for.
     * @returns tuya device API instance
     */
    private getTuyaDevice(minionDevice: MinionDevice): any {
        if (!(minionDevice.pysicalDevice.mac in this.pysicalDevicesMap)) {
            this.createTuyaDevice(minionDevice);
        }
        return this.pysicalDevicesMap[minionDevice.pysicalDevice.mac];
    }

    public async getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
        /**
         * Get tuya device instance
         */
        const tuyaDevice = this.getTuyaDevice(miniom.device);

        const stausResult = await tuyaDevice.get({ schema: true })
            .catch((err: Error) => {
                logger.warn(`Fail to get status of ${miniom.minionId}, ${err.message}`);
                throw {
                    responseCode: 1503,
                    message: 'communication with tuya device fail',
                } as ErrorResponse;
            });

        /**
         * Extract the current minion status.
         */
        let currentGangStatus: boolean;
        switch (miniom.device.model) {
            case 'wall switch, 3 gangs, first one':
                currentGangStatus = stausResult.dps[1];
                break;
            case 'wall switch, 3 gangs, second one':
                currentGangStatus = stausResult.dps[2];
                break;
            case 'wall switch, 3 gangs, third one':
                currentGangStatus = stausResult.dps[3];
                break;
        }

        return {
            switch: {
                status: currentGangStatus ? 'on' : 'off',
            },
        };
    }

    public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        /**
         * Get tuya device instance
         */
        const tuyaDevice = this.getTuyaDevice(miniom.device);

        /**
         * Get current minion gang index.
         */
        let gangIndex: number;
        switch (miniom.device.model) {
            case 'wall switch, 3 gangs, first one':
                gangIndex = 1;
                break;
            case 'wall switch, 3 gangs, second one':
                gangIndex = 2;
                break;
            case 'wall switch, 3 gangs, third one':
                gangIndex = 3;
                break;
        }

        await tuyaDevice.set({ set: setStatus.switch.status === 'on', dps: gangIndex })
            .catch((err) => {
                logger.warn(`Fail to get status of ${miniom.minionId}, ${err.message}`);
                throw {
                    responseCode: 1503,
                    message: 'communication with tuya device fail',
                } as ErrorResponse;
            });
    }

    public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        throw {
            responseCode: 6409,
            message: 'the tuya module not support any recording mode',
        } as ErrorResponse;
    }
}
