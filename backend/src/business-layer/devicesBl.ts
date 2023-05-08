import { SyncEvent } from 'ts-events';
import { Duration } from 'unitsnet-js';
import { inspect } from 'util';
import { DevicesDal, DevicesDalSingleton } from '../data-layer/devicesDal';
import { DeviceKind, LocalNetworkDevice } from '../models/sharedInterfaces';
import { ModulesManager, modulesManager } from '../modules/modulesManager';
import { LocalNetworkReader } from '../utilities/lanManager';
import { logger } from '../utilities/logger';

const DETECT_NETWORK_CHANGES_ACTIVATION = Duration.FromHours(1);

export class DevicesService {
  /**
   * Local devices changes feed.
   */
  public devicesUpdate = new SyncEvent<LocalNetworkDevice[]>();
  // Dependencies
  private localNetworkReader: () => Promise<LocalNetworkDevice[]>;
  private devicesDal: DevicesDal;
  private modulesManager: ModulesManager;

  /**
   * local devices.
   */
  private localDevices: LocalNetworkDevice[] = [];

  /**
   * Init DevicesBl . using dependecy injection pattern to allow units testings.
   * @param devicesDal Inject devices dal.
   * @param localNetworkReader Inject the reader function.
   */
  constructor(
    devicesDal: DevicesDal,
    localNetworkReader: () => Promise<LocalNetworkDevice[]>,
    modulesManager: ModulesManager,
  ) {
    this.devicesDal = devicesDal;
    this.localNetworkReader = localNetworkReader;
    this.modulesManager = modulesManager;

    // Attach subscription to the drivers update regarding device status update. such as battery status etc.
    this.modulesManager.deviceStatusChangedEvent?.attach?.((deviceUpdate) => {
      for (const device of this.localDevices) {
        if (device.mac === deviceUpdate.mac) {
          logger.info(`[DevicesService] Updating device "${device.mac}" due to update from driver with new status "${JSON.stringify(deviceUpdate.status)}"`);
          device.deviceStatus = deviceUpdate.status;
          return;
        }
      }
    });

    setInterval(async () => {
      logger.info(`[DevicesService] About to scan netwrok changes as activation each ${DETECT_NETWORK_CHANGES_ACTIVATION}`);
      try {
        await this.rescanNetwork();
      } catch (error) {
        logger.info(`[DevicesService] Scan network failed ${inspect(error, false, 5)}`);
      }
    }, DETECT_NETWORK_CHANGES_ACTIVATION.Milliseconds);
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
    const localDevice = this.localDevices.find(d => d.mac === deviceToSet.mac);
    localDevice.name = deviceToSet.name;
    this.devicesUpdate.post(this.localDevices);
  }

  /**
   * Rescan local network.
   */
  public async rescanNetwork(): Promise<void> {
    await this.loadDevices();
    this.devicesUpdate.post(this.localDevices);
  }

  /**
   * Get devices models kinds array.
   */
  public async getDevicesKins(): Promise<DeviceKind[]> {
    return this.modulesManager.devicesKind;
  }

  /**
   * Load local network devices data.
   */
  private async loadDevices(): Promise<void> {
    const cachedDevices = await this.devicesDal.getDevices();

    // Read the network devices
    let networkDevices: LocalNetworkDevice[] = [];
    try {
      networkDevices = await this.localNetworkReader();
    } catch (error) {
      logger.warn('Loading devices network fail');
    }

    const unknown = '------------';

    // Set the cached name if cached
    for (const networkDevice of networkDevices) {
      const localDevice = cachedDevices.find(d => d.mac === networkDevice.mac);
      networkDevice.name = localDevice?.name || unknown;
    }

    // Collect all cached devices that not found in the network
    const unconnectedDevices: LocalNetworkDevice[] = [];
    for (const cachedDevice of cachedDevices) {
      if (!networkDevices.some(d => d.mac === cachedDevice.mac)) {
        cachedDevice.ip = '';
        unconnectedDevices.push(cachedDevice);
      }
    }

    // Merge all devices into one collection, while the network devices in the first
    this.localDevices = [...networkDevices, ...unconnectedDevices,];
  }
}

export const devicesService = new DevicesService(DevicesDalSingleton, LocalNetworkReader, modulesManager);
