import * as moment from 'moment';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { DeviceKind, ErrorResponse, Minion, MinionStatus } from '../../../src/models/sharedInterfaces';
import { Delay } from '../../../src/utilities/sleep';

export class ModulesManagerMock {
  /**
   * Let subscribe to any status minion changed. from any brand module.
   */
  public minionStatusChangedEvent = new BehaviorSubject<{
    minionId: string;
    status: MinionStatus;
  }>({
    minionId: '',
    status: undefined,
  });

  public get devicesKind(): DeviceKind[] {
    return [
      {
        brand: 'test mock',
        isTokenRequired: false,
        isIdRequired: false,
        minionsPerDevice: 1,
        model: 'switch demo',
        supportedMinionType: 'switch',
        isRecordingSupported: false,
        isFetchCommandsAvailable: false,
      },
      {
        brand: 'test mock',
        isTokenRequired: true,
        isIdRequired: false,
        minionsPerDevice: 1,
        model: 'switch demo with token',
        supportedMinionType: 'switch',
        isRecordingSupported: false,
        isFetchCommandsAvailable: false,
      },
      {
        brand: 'test mock',
        isTokenRequired: false,
        isIdRequired: false,
        minionsPerDevice: -1,
        model: 'ac demo',
        supportedMinionType: 'airConditioning',
        isRecordingSupported: true,
        isFetchCommandsAvailable: true,
      },
      {
        brand: 'test mock',
        isTokenRequired: false,
        isIdRequired: false,
        minionsPerDevice: -1,
        model: 'ac 2 demo',
        supportedMinionType: 'airConditioning',
        isRecordingSupported: true,
        isFetchCommandsAvailable: false,
      },
    ];
  }

  public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    await Delay(moment.duration(1, 'seconds'));
    if (minion.device.model === 'switch demo') {
      return {
        switch: {
          status: 'on',
        },
      };
    } else if (minion.device.model === 'ac demo') {
      return {
        airConditioning: {
          fanStrength: 'med',
          mode: 'cold',
          status: 'on',
          temperature: 21,
        },
      };
    }
    throw {
      responseCode: 4005,
      message: 'unknown model',
    } as ErrorResponse;
  }

  public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    await Delay(moment.duration(0.5, 'seconds')); // Here shuold be the real communication with device.
    return;
  }

  public async refreshModules(): Promise<void> { }

  public async refreshModule(brand: string): Promise<void> { }
}
