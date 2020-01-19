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
    {
      brand: this.brandName,
      isTokenRequierd: false,
      isIdRequierd: true,
      minionsPerDevice: -1,
      model: 'air conditioning',
      suppotedMinionType: 'airConditioning',
      isRecordingSupported: false,
    },
    {
      brand: this.brandName,
      isTokenRequierd: false,
      isIdRequierd: true,
      minionsPerDevice: -1,
      model: 'light',
      suppotedMinionType: 'light',
      isRecordingSupported: false,
    },
    {
      brand: this.brandName,
      isTokenRequierd: false,
      isIdRequierd: true,
      minionsPerDevice: -1,
      model: 'temperature light',
      suppotedMinionType: 'temperatureLight',
      isRecordingSupported: false,
    },
    {
      brand: this.brandName,
      isTokenRequierd: false,
      isIdRequierd: true,
      minionsPerDevice: -1,
      model: 'color light',
      suppotedMinionType: 'colorLight',
      isRecordingSupported: false,
    },
    {
      brand: this.brandName,
      isTokenRequierd: false,
      isIdRequierd: true,
      minionsPerDevice: -1,
      model: 'roller',
      suppotedMinionType: 'roller',
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
    let triggerPayload = `${miniom.minionId}-${setStatus[miniom.minionType].status}`;

    if (setStatus[miniom.minionType].status === 'on') {
      switch (miniom.minionType) {
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
      await request(`https://maker.ifttt.com/trigger/${triggerPayload}/with/key/${miniom.device.deviceId}`);
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

  public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    // There's nothing to do.
  }

  public async refreshCommunication(): Promise<void> {
    // There's nothing to do.
  }
}
