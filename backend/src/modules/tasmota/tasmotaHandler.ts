import * as moment from 'moment';
import { Duration } from 'moment';
import * as request from 'request-promise';
import { BehaviorSubject } from 'rxjs';
import { CommandsSet } from '../../models/backendInterfaces';
import { DeviceKind, ErrorResponse, Minion, MinionStatus, SwitchOptions, Toggle } from '../../models/sharedInterfaces';
import { DeepCopy } from '../../utilities/deepCopy';
import { logger } from '../../utilities/logger';
import { BrandModuleBase } from '../brandModuleBase';

export class TasmotaHandler extends BrandModuleBase {
  public readonly brandName: string = 'tasmota';

  public readonly devices: DeviceKind[] = [
    {
      brand: this.brandName,
      isTokenRequierd: false,
      isIdRequierd: false,
      minionsPerDevice: 1,
      model: 'switch',
      suppotedMinionType: 'switch',
      isRecordingSupported: false,
    },
  ];

  constructor() {
    super();
  }

  public async getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
    try {
      const tosmotaStatus = await request(`http://${miniom.device.pysicalDevice.ip}/cm?cmnd=Power`);
      const status = JSON.parse(tosmotaStatus).POWER.toLowerCase() as SwitchOptions;
      return {
        switch: {
          status,
        },
      };
    } catch (error) {
      logger.warn(`Sent Tosmota command ${miniom.minionId} fail, ${JSON.stringify(error.message)}`);
      throw {
        responseCode: 1503,
        message: 'tosmota request fail.',
      } as ErrorResponse;
    }
  }

  public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    try {
      await request(`http://${miniom.device.pysicalDevice.ip}/cm?cmnd=Power%20${setStatus[miniom.minionType].status}`);
    } catch (error) {
      logger.warn(`Sent TOsmota command ${miniom.minionId} fail, ${JSON.stringify(error.message)}`);
      throw {
        responseCode: 1503,
        message: 'tosmota request fail.',
      } as ErrorResponse;
    }
  }

  public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    throw {
      responseCode: 6409,
      message: 'the tosmota module not support any recording mode',
    } as ErrorResponse;
  }

  public async generateCommand(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    throw {
      responseCode: 6409,
      message: 'the tosmota module not support any recording mode',
    } as ErrorResponse;
  }

  public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    // There's nothing to do.
  }

  public async refreshCommunication(): Promise<void> {
    // There's nothing to do.
  }
}
