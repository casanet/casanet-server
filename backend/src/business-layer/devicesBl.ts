import { DevicesDal, DevicesDalSingleton } from '../data-layer/devicesDal';
import { DeviceKind, LocalNetworkDevice } from '../models/sharedInterfaces';
import { ModulesManager, ModulesManagerSingltone } from '../modules/modulesManager';
import { LocalNetworkReader } from '../utilities/lanManager';
import { logger } from '../utilities/logger';

export class DevicesBl {

    private localNetworkReader: () => Promise<LocalNetworkDevice[]>;
    private devicesDal: DevicesDal;
    private modulesManager: ModulesManager;

    private localDevices: LocalNetworkDevice[] = [];

    /**
     * Init DevicesBl . using dependecy injection pattern to allow units testings.
     * @param devicesDal Inject devices dal.
     * @param localNetworkReader Inject the reader function.
     */
    constructor(devicesDal: DevicesDal, localNetworkReader: () => Promise<LocalNetworkDevice[]>, modulesManager: ModulesManager) {
        this.devicesDal = devicesDal;
        this.localNetworkReader = localNetworkReader;
        this.modulesManager = modulesManager;

        this.loadDevices()
            .then(() => {
                logger.info('Loading devices table done.');
            })
            .catch(() => {
                logger.error('Loading devices table fail.');
            });
    }

    /**
     * Load local devices name from saved cache.
     */
    private async loadDevicesName(): Promise<void> {
        const cachedDevices = await this.devicesDal.getDevices();

        for (const localDevice of this.localDevices) {
            for (const cachedDevice of cachedDevices) {
                if (cachedDevice.mac === localDevice.mac) {
                    localDevice.name = cachedDevice.name;
                    break;
                }
            }
        }
    }

    /**
     * Load nlocal netword devices data.
     */
    private async loadDevices(): Promise<void> {
        this.localDevices = await this.localNetworkReader()
            .catch(() => {
                logger.warn('Loading devices network fail, setting devices as empty array...');
                this.localDevices = [];
            }) as LocalNetworkDevice[];

        await this.loadDevicesName()
            .catch(() => {
                logger.warn('Loading devices names fail');
            });
    }

    /**
     * Get all local network devices
     */
    public async getDevices(): Promise<LocalNetworkDevice[]> {
        return this.localDevices;
    }

    /**
     * Set name to device.
     * @param deviceToSet Device to cached.
     */
    public async setDeviceName(deviceToSet: LocalNetworkDevice): Promise<void> {
        await this.devicesDal.saveDevice(deviceToSet);
        await this.loadDevicesName();
    }

    /**
     * Rescan local network.
     */
    public async rescanNetwork(): Promise<void> {
        await this.loadDevices();
    }

    public async getDevicesKins(): Promise<DeviceKind[]> {
        return this.modulesManager.devicesKind;
    }
}

export const DevicesBlSingleton = new DevicesBl(DevicesDalSingleton, LocalNetworkReader, ModulesManagerSingltone);
