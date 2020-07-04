import * as moment from 'moment';
import { Duration } from 'moment';
import * as request from 'request-promise';
import { BehaviorSubject } from 'rxjs';
import { CommandsSet } from '../../models/backendInterfaces';
import { DeviceKind, ErrorResponse, Minion, MinionStatus, SwitchOptions, Toggle } from '../../models/sharedInterfaces';
import { DeepCopy } from '../../utilities/deepCopy';
import { logger } from '../../utilities/logger';
import { BrandModuleBase } from '../brandModuleBase';

export class IftttHandler extends BrandModuleBase {
  public readonly brandName: string = 'ifttt';

  public readonly devices: DeviceKind[] = [
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'toggle',
      supportedMinionType: 'toggle',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'switch',
      supportedMinionType: 'switch',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'air conditioning',
      supportedMinionType: 'airConditioning',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'light',
      supportedMinionType: 'light',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'temperature light',
      supportedMinionType: 'temperatureLight',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'color light',
      supportedMinionType: 'colorLight',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName,
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'roller',
      supportedMinionType: 'roller',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
  ];

  constructor() {
    super();
  }

  public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    /** Currently there is no API to get the real current status. */
    return minion.minionStatus;
  }

  public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    let triggerPayload = `${minion.minionId}-${setStatus[minion.minionType].status}`;

    if (setStatus[minion.minionType].status === 'on') {
      switch (minion.minionType) {
        case 'airConditioning':
          // tslint:disable-next-line:max-line-length
          triggerPayload += `-${setStatus.airConditioning.mode}-${setStatus.airConditioning.fanStrength}-${setStatus.airConditioning.temperature}`;
          break;
        case 'light':
          triggerPayload += `-${setStatus.light.brightness}`;
          break;
        case 'temperatureLight':
          triggerPayload += `-${setStatus.temperatureLight.brightness}-${setStatus.temperatureLight.temperature}`;
          break;
        case 'colorLight':
          // tslint:disable-next-line:max-line-length
          triggerPayload += `-${setStatus.colorLight.brightness}-${setStatus.colorLight.temperature}-${setStatus.colorLight.red}-${setStatus.colorLight.green}-${setStatus.colorLight.blue}`;
          break;
        case 'roller':
          triggerPayload += `-${setStatus.roller.direction}`;
          break;
      }
    }

    try {
      // tslint:disable-next-line:max-line-length
      await request(`https://maker.ifttt.com/trigger/${triggerPayload}/with/key/${minion.device.deviceId}`);
    } catch (error) {
      logger.warn(`Sent IFTTT trigger for ${minion.minionId} fail, ${JSON.stringify(error.message)}`);
      throw {
        responseCode: 7409,
        message: 'Ifttt triggger fail.',
      } as ErrorResponse;
    }
  }

  public async enterRecordMode(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    throw {
      responseCode: 6409,
      message: 'the ifttt module not support any recording mode',
    } as ErrorResponse;
  }

  public async generateCommand(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    throw {
      responseCode: 6409,
      message: 'the ifttt module not support any recording mode',
    } as ErrorResponse;
  }

  public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    // There's nothing to do.
  }

  public async refreshCommunication(): Promise<void> {
    // There's nothing to do.
  }
}
