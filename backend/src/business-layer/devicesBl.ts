import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { DevicesDal, DevicesDalSingleton } from '../data-layer/devicesDal';
import { DeviceKind, LocalNetworkDevice } from '../models/sharedInterfaces';
import { ModulesManager, ModulesManagerSingltone } from '../modules/modulesManager';
import { LocalNetworkReader } from '../utilities/lanManager';
import { logger } from '../utilities/logger';

export class DevicesBl {
  /**
   * Local devices changes feed.
   */
  public devicesUpdate = new BehaviorSubject<LocalNetworkDevice[]>([]);
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
    this.devicesUpdate.next(this.localDevices);
  }

  /**
   * Rescan local network.
   */
  public async rescanNetwork(): Promise<void> {
    await this.loadDevices();
    this.devicesUpdate.next(this.localDevices);
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
        cachedDevice.ip = unknown;
        unconnectedDevices.push(cachedDevice);
      }
    }

    // Merge all devices into one collection, while the network devices in the first
    this.localDevices = [...networkDevices, ...unconnectedDevices,];
  }
}

export const DevicesBlSingleton = new DevicesBl(DevicesDalSingleton, LocalNetworkReader, ModulesManagerSingltone);
