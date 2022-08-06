import { Minion, MinionStatus, SwitchOptions } from '../../../models/sharedInterfaces';
import { MqttBaseDriver, MqttMessage, ParsedMqttMessage } from './mqttBaseDriver';

export class TasmotaMqttDriver extends MqttBaseDriver {

  public deviceIdentity: 'minionId' | 'deviceId' = 'deviceId';

  /**
   * Let abstract know the tasmota topic
   * (After changing by tasmota web interface the topic to 'sonoff/[deviceId]')
   */
  public deviceTopics = 'stat/sonoff/+/POWER';

  public isDeviceMessage(topic: string): boolean {
    const topics = topic.split('/');
    const publisher = topics?.[1];
    return publisher === 'sonoff';
  }

  public convertSetStatusMessage(minion: Minion, setStatus: MinionStatus): MqttMessage {
    return {
      topic: `cmnd/sonoff/${minion?.device?.deviceId || 'unknown'}/POWER`,
      data: setStatus?.[minion.minionType]?.status?.toUpperCase?.(),
    };
  }

  public convertRequestStateMessage(minion: Minion): MqttMessage | undefined {
    return {
      topic: `cmnd/sonoff/${minion?.device?.deviceId || 'unknown'}/POWER`,
      data: '',
    };
  }

  public convertMqttMessage(topic: string, data: string): ParsedMqttMessage | undefined {
    const topics = topic.split('/');
    const deviceId = topics[2];

    const minionStatus: MinionStatus = {
      switch: {
        status: data.toLowerCase() as SwitchOptions,
      },
    };
    return {
      id: deviceId,
      minionStatus,
    };
  }
}
