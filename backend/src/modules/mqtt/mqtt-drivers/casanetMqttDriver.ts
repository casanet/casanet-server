import { DeviceKind, Minion, MinionStatus, SwitchOptions } from '../../../models/sharedInterfaces';
import { MqttBaseDriver, MqttMessage, ParsedMqttMessage } from './mqttBaseDriver';

export class CasanetMqttDriver extends MqttBaseDriver {

  public readonly brandName: string[] = [];

  public devices: DeviceKind[] = [];

  public deviceTopics = [
    'casanet/state/+',
  ];


  public isDeviceMessage(topic: string): boolean {
    const topics = topic.split('/');
    const publisher = topics?.[0];
    return publisher === 'casanet';
  }


  public convertSetStatusMessage(minion: Minion, setStatus: MinionStatus): MqttMessage[] {


    return [{
      topic: `casanet/set/${minion.minionId}`,
      data: JSON.stringify(setStatus),
    }];
  }

  public convertRequestStateMessage(minion: Minion): MqttMessage[] {
    return [{
      topic: `casanet/get/${minion.minionId}`,
      data: '',
    }];
  }
  
  public async getStatus(minion: Minion): Promise<MinionStatus> {
    return;
  }

  public async convertMqttMessage(topic: string, data: string): Promise<ParsedMqttMessage> {
    const topics = topic.split('/');
    const minionId = topics[1];

    const minions = await this.retrieveMinions.pull();

    const minion = minions.find(m => {
      return m?.minionId === minionId;
    });

    return {
      minion,
      minionStatus: JSON.parse(data)
    };
  }
}
