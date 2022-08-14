import * as moment from 'moment';
import { Duration } from 'moment';
import { CommandsSet } from '../../models/backendInterfaces';
import { DeviceKind, ErrorResponse, Minion, MinionStatus, SwitchOptions, Toggle } from '../../models/sharedInterfaces';
import { DeepCopy } from '../../utilities/deepCopy';
import { Delay } from '../../utilities/sleep';
import { BrandModuleBase } from '../brandModuleBase';

export class MockHandler extends BrandModuleBase {
  public readonly brandName: string = 'mock';

  public readonly devices: DeviceKind[] = [
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: 1,
      model: 'switch demo',
      supportedMinionType: 'switch',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'ac demo',
      supportedMinionType: 'airConditioning',
      isRecordingSupported: true,
      isFetchCommandsAvailable: true,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'RF toggle demo',
      supportedMinionType: 'toggle',
      isRecordingSupported: true,
      isFetchCommandsAvailable: true,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'Light demo',
      supportedMinionType: 'light',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'Temperature Light demo',
      supportedMinionType: 'temperatureLight',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'Color Light demo',
      supportedMinionType: 'colorLight',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'Roller demo',
      supportedMinionType: 'roller',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: false,
      minionsPerDevice: -1,
      model: 'Temperature Sensor Demo',
      supportedMinionType: 'temperatureSensor',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
  ];
  /**
   * Time duration to mock physical device status update for switch minion.
   */
  private readonly SWITCH_CHANGED_INTERVAL: Duration = moment.duration(4, 'seconds');

  /**
   * Time duration to mock physical device status update for ac minion.
   */
  private readonly AC_CHANGED_INTERVAL: Duration = moment.duration(5, 'seconds');

  constructor() {
    super();

    // for debug updates remove 'return'
    return;
    setInterval(async () => {
      const minions = await this.retrieveMinions.pull();

      if (minions.length === 0 || !minions[0].minionStatus || !minions[0].minionStatus[minions[0].minionType]) {
        return;
      }

      const statusCopy = DeepCopy<MinionStatus>(minions[0].minionStatus);

      const statusObject = statusCopy[minions[0].minionType] as Toggle;
      statusObject.status = statusObject.status === 'off' ? 'on' : 'off';

      this.minionStatusChangedEvent.post({
        minionId: minions[0].minionId,
        status: statusCopy,
      });
    }, this.SWITCH_CHANGED_INTERVAL.asMilliseconds());

    setInterval(() => {
      this.minionStatusChangedEvent.post({
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
  public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.

    switch (minion.device.model) {
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
      case 'Temperature Sensor Demo':
        return {
          temperatureSensor: {
            status: 'on',
            temperature:  Math.floor(Math.random() * 1000) / 10,
          },
        };
    }

    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.
    if (
      minion.device.model === 'switch demo' ||
      minion.device.model === 'ac demo' ||
      minion.device.model === 'RF toggle demo' ||
      minion.device.model === 'Roller demo' ||
      minion.device.model === 'Light demo' ||
      minion.device.model === 'Temperature Light demo' ||
      minion.device.model === 'Color Light demo' ||
      minion.device.model === 'Temperature Sensor Demo'
    ) {
      return;
    }

    throw {
      responseCode: 8404,
      message: 'unknown minion model',
    } as ErrorResponse;
  }

  public async enterRecordMode(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.
  }

  public async generateCommand(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real command generation.
  }

  public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    // There's nothing to do.
  }

  public async refreshCommunication(): Promise<void> {
    // There's nothing to do.
  }
}
