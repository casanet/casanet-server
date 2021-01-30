import * as moment from 'moment';
import * as Tuyapi from 'tuyapi';
import { CommandsSet } from '../../models/backendInterfaces';
import {
  DeviceKind,
  ErrorResponse,
  Minion,
  MinionDevice,
  MinionStatus,
  RollerDirection,
  SwitchOptions,
} from '../../models/sharedInterfaces';
import { logger } from '../../utilities/logger';
import { Delay } from '../../utilities/sleep';
import { BrandModuleBase } from '../brandModuleBase';

export class TuyaHandler extends BrandModuleBase {
  public readonly brandName: string = 'tuya';

  public readonly devices: DeviceKind[] = [
    {
      brand: this.brandName,
      isTokenRequired: true,
      isIdRequired: true,
      minionsPerDevice: 3,
      model: 'wall switch, 3 gangs, first one',
      supportedMinionType: 'switch',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: true,
      isIdRequired: true,
      minionsPerDevice: 3,
      model: 'wall switch, 3 gangs, second one',
      supportedMinionType: 'switch',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: true,
      isIdRequired: true,
      minionsPerDevice: 3,
      model: 'wall switch, 3 gangs, third one',
      supportedMinionType: 'switch',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: true,
      isIdRequired: true,
      minionsPerDevice: 1,
      model: 'curtain',
      supportedMinionType: 'roller',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
  ];

  /**
   * Map devices by mac address
   */
  private pysicalDevicesMap: { [key: string]: Tuyapi } = {};

  /** Cache last status, to ignore unnececary updates.  */
  private devicesStatusCache: { [key: string]: any } = {};

  constructor() {
    super();
  }

  public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    /**
     * Get tuya device instance
     */
    const tuyaDevice = await this.getTuyaDevice(minion.device);

    if (minion.device.model.indexOf('curtain') !== -1) {
      try {
        const rowStatus = await tuyaDevice.get();

        this.watchDevice(tuyaDevice, minion.device);

        return {
          roller: {
            status: rowStatus !== '3' ? 'on' : 'off',
            direction: rowStatus === '1' ? 'up' : 'down',
          },
        };
      } catch (err) {
        logger.warn(`Fail to get status of ${minion.minionId}, ${err}`);

        if (typeof err === 'object' && err.message === 'fffffffffffffff') {
          throw {
            responseCode: 9503,
            message:
              'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
          } as ErrorResponse;
        }

        throw {
          responseCode: 1503,
          message: 'communication with tuya device fail',
        } as ErrorResponse;
      }
    }

    const stausResult = await tuyaDevice.get({ schema: true }).catch((err: Error) => {
      logger.warn(`Fail to get status of ${minion.minionId}, ${err}`);

      if (
        typeof err === 'object' &&
        err.message ===
        'Error communicating with device. Make sure nothing else is trying to control it or connected to it.'
      ) {
        throw {
          responseCode: 9503,
          message:
            'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
        } as ErrorResponse;
      }

      throw {
        responseCode: 1503,
        message: 'communication with tuya device fail',
      } as ErrorResponse;
    });

    /** Case stausResult get a garbage value */
    if (typeof stausResult !== 'object' || !stausResult.dps) {
      throw {
        responseCode: 10503,
        message: 'tuya device gives garbage values.',
      } as ErrorResponse;
    }

    /**
     * Extract the current minion status.
     */
    let currentGangStatus: boolean;
    switch (minion.device.model) {
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

    this.watchDevice(tuyaDevice, minion.device);

    return {
      switch: {
        status: currentGangStatus ? 'on' : 'off',
      },
    };
  }

  public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    /**
     * Get tuya device instance
     */
    const tuyaDevice = await this.getTuyaDevice(minion.device);

    if (minion.device.model.indexOf('curtain') !== -1) {
      try {
        await tuyaDevice.set({
          set: setStatus.roller.status === 'off' ? '3' : setStatus.roller.direction === 'up' ? '1' : '2',
        });
        this.watchDevice(tuyaDevice, minion.device);

        return;
      } catch (err) {
        logger.warn(`Fail to get status of ${minion.minionId}, ${err}`);

        if (
          typeof err === 'object' &&
          err.message ===
          'Error communicating with device. Make sure nothing else is trying to control it or connected to it.'
        ) {
          throw {
            responseCode: 9503,
            message:
              'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
          } as ErrorResponse;
        }

        throw {
          responseCode: 1503,
          message: 'communication with tuya device fail',
        } as ErrorResponse;
      }
    }

    /**
     * Get current minion gang index.
     */
    let gangIndex: number;
    switch (minion.device.model) {
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

    await tuyaDevice.set({ set: setStatus.switch.status === 'on', dps: gangIndex }).catch(err => {
      logger.warn(`Fail to get status of ${minion.minionId}, ${err}`);

      if (
        typeof err === 'object' &&
        err.message ===
        'Error communicating with device. Make sure nothing else is trying to control it or connected to it.'
      ) {
        throw {
          responseCode: 9503,
          message:
            'Error communicating with device. Make sure nothing else is trying to control it or connected to it.',
        } as ErrorResponse;
      }

      throw {
        responseCode: 1503,
        message: 'communication with tuya device fail',
      } as ErrorResponse;
    });

    this.watchDevice(tuyaDevice, minion.device);
  }

  public async enterRecordMode(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    throw {
      responseCode: 6409,
      message: 'the tuya module not support any recording mode',
    } as ErrorResponse;
  }

  public async generateCommand(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    throw {
      responseCode: 6409,
      message: 'the tuya module not support any recording mode',
    } as ErrorResponse;
  }

  public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    // There's nothing to do.
  }

  public async refreshCommunication(): Promise<void> {
    for (const tuyaApi of Object.values(this.pysicalDevicesMap)) {
      try {
        tuyaApi.disconnect();
      } catch (error) {
      }
    }
    this.pysicalDevicesMap = {};
  }

  /**
   * Get tuya device API instance.
   * @param minionDevice The minion device property. to get tuya instance for.
   * @returns tuya device API instance
   */
  private async getTuyaDevice(minionDevice: MinionDevice): Promise<any> {

    // If the device is currently running inbackgroud, disconnect it.
    if (minionDevice.pysicalDevice.mac in this.pysicalDevicesMap) {
      try {
        this.pysicalDevicesMap[minionDevice.pysicalDevice.mac].disconnect();
      } catch (error) { }
    }

    // Create the new instance
    const device = new Tuyapi({
      id: minionDevice.deviceId,
      key: minionDevice.token,
      persistentConnection: true,
    });

    // Find the device in the network
    await device.find();

    // Connect to it (TCP channel)
    await device.connect();

    // Retunr the instance, ready to use.
    return device;
  }

  /**
   * On the set/get finished, call to this method to keep device and subscribe status events
   * @param tuyaDevice 
   * @param minionDevice 
   */
  private async watchDevice(tuyaDevice: Tuyapi, minionDevice: MinionDevice) {

    // Keep the device
    this.pysicalDevicesMap[minionDevice.pysicalDevice.mac] = tuyaDevice;

    /**
     * Subscribe to status changed event.
     */
    tuyaDevice.on('data', async data => {
      /** Case data arrived with garbage value */
      if (typeof data === 'string') {
        return;
      }

      /** If data same as cached, abort. */
      if (this.devicesStatusCache[minionDevice.pysicalDevice.mac] === JSON.stringify(data)) {
        return;
      }
      /** Save data as last status cache. */
      this.devicesStatusCache[minionDevice.pysicalDevice.mac] = JSON.stringify(data);

      logger.debug(`tuya device mac: ${minionDevice.pysicalDevice.mac} data arrived`);

      if (minionDevice.model.includes('curtain')) {
        try {
          const rowStatus = await tuyaDevice.get();

          const minions = await this.retrieveMinions.pull();

          for (const minion of minions) {
            /**
             * Find the minions that used current pysical tuya device
             */
            if (minion.device.deviceId !== minionDevice.deviceId) {
              continue;
            }

            logger.debug(`[tuyaHandler] minion "${minion.minionId}" status arrived from device ${JSON.stringify(rowStatus)}`);

            const status: SwitchOptions = rowStatus !== '3' ? 'on' : 'off';
            const direction: RollerDirection = rowStatus === '1' ? 'up' : 'down';

            this.minionStatusChangedEvent.next({
              minionId: minion.minionId,
              status: {
                roller: {
                  status,
                  direction,
                },
              },
            });
          }
        } catch (error) { }
        return;
      }
      /**
       * Get the current status (the 'data' paramerer is invalid)
       */
      tuyaDevice.get({ schema: true }).then(status => {
        /** Case status get a garbage value */
        if (typeof status !== 'object' || !status.dps) {
          return;
        }

        /**
         * Pull the current minions array in system.
         */
        this.retrieveMinions.pull().then(minions => {
          for (const minion of minions) {
            /**
             * Find the minions that used current pysical tuya device
             */
            if (minion.device.deviceId !== minionDevice.deviceId) {
              continue;
            }

            logger.debug(`[tuyaHandler] minion "${minion.minionId}" status arrived from device ${JSON.stringify(status)}`);

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
     * Subscribe to error event.
     */
    tuyaDevice.on('error', async err => {
      logger.debug(`[tuyaHandler] tuya device mac: ${minionDevice.pysicalDevice.mac} error: ${JSON.stringify(err)}`);

      try {
        tuyaDevice.disconnect();
        delete this.pysicalDevicesMap[minionDevice.pysicalDevice.mac];

        await Delay(moment.duration(5, 'seconds'));
        await this.getTuyaDevice(minionDevice);
      } catch (error) {
        logger.warn(
          `reconnecting TCP connection to the tuya mac: ${minionDevice.pysicalDevice.mac} fail error: ${error}`,
        );
      }
    });
  }


}
