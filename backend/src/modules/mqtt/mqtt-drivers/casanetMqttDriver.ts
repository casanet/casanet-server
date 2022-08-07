import { Minion, MinionStatus, SwitchOptions } from '../../../models/sharedInterfaces';
import { MqttBaseDriver, MqttMessage, ParsedMqttMessage } from './mqttBaseDriver';

export class CasanetMqttDriver extends MqttBaseDriver {

  public deviceIdentity: 'minionId' | 'deviceId' = 'minionId';
  
  public deviceTopics = [
    'casanet/state/+',
  ];

  
  public isDeviceMessage(topic: string): boolean {
    const topics = topic.split('/');
    const publisher = topics?.[0];
    return publisher === 'casanet';
  }


  public convertSetStatusMessage(minion: Minion, setStatus: MinionStatus): MqttMessage {


    return {
      topic: `casanet/set/${minion.minionId}`,
      data: JSON.stringify(setStatus),
    };
  }

  public convertRequestStateMessage(minion: Minion): MqttMessage | undefined {
    return {
      topic: `casanet/get/${minion.minionId}`,
      data: '',
    };
  }

  public convertMqttMessage(topic: string, data: string): ParsedMqttMessage | undefined {
    const topics = topic.split('/');
    const minionId = topics[1];
  
    return {
      id: minionId,
      minionStatus: JSON.parse(data)
    };
  }
}
