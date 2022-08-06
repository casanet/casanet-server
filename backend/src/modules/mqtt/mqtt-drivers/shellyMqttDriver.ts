import { Minion, MinionStatus, SwitchOptions } from '../../../models/sharedInterfaces';
import { MqttBaseDriver, MqttMessage, ParsedMqttMessage } from './mqttBaseDriver';

export class ShellyMqttDriver extends MqttBaseDriver {

  public deviceIdentity: 'minionId' | 'deviceId' = 'deviceId';

  public deviceTopics = [
    'shellies/+/relay/0', // Switches update, such as shelly 1PM
    'shellies/+/color/0/status', // Blob light updates
    'shellies/+/input_event/0', // Button clicked update
    'shellies/+/sensor/battery', // Battery (in percentage) update.
  ];

  public isDeviceMessage(topic: string): boolean {
    const topics = topic.split('/');
    const publisher = topics?.[0];
    return publisher === 'shellies';
  }

  public convertSetStatusMessage(minion: Minion, setStatus: MinionStatus): MqttMessage {
    let data;
    let topic;
    let command;

    if (minion.minionType === 'switch' || minion.minionType === 'toggle') {
      command = 'command';
      topic = 'relay';
      data = setStatus?.[minion.minionType]?.status?.toLowerCase?.();
    } else if (minion.minionType === 'colorLight') {
      const colorLight = setStatus.colorLight;

      colorLight.temperature
      command = 'set';
      topic = 'color';
      data = JSON.stringify({
        "mode": "color",    /* "color" or "white" */
        "red": colorLight.red,           /* red brightness, 0..255, applies in mode="color" */
        "green": colorLight.green,         /* green brightness, 0..255, applies in mode="color" */
        "blue": colorLight.blue,        /* blue brightness, 0..255, applies in mode="color" */
        "gain": colorLight.brightness,        /* gain for all channels, 0..100, applies in mode="color" */
        "brightness": colorLight.brightness,  /* brightness, 0..100, applies in mode="white" */
        "white": colorLight.temperature,         /* white brightness, 0..255, applies in mode="color" */
        "temp": 4750,       /* color temperature in K, 3000..6500, applies in mode="white" */
        "effect": 0,        /* applies an effect when set */
        "turn": colorLight.status,       /* "on", "off" or "toggle" */
        "transition": 500   /* One-shot transition, `0..5000` [ms] */
      });
    }

    return {
      topic: `shellies/${minion?.device?.deviceId || 'unknown'}/${topic}/0/${command}`,
      data: data,
    };
  }

  public convertRequestStateMessage(minion: Minion): MqttMessage | undefined {
    return undefined;
  }

  public convertMqttMessage(topic: string, data: string): ParsedMqttMessage | undefined {
    const topics = topic.split('/');
    const deviceId = topics[1];
    const deviceType = topics[2];


    let minionStatus: MinionStatus;

    if (deviceType === 'relay') {
      minionStatus = {
        switch: {
          status: data.toLowerCase() as SwitchOptions,
        },
      };
    } else if (deviceType === 'color') {
      const asJson = JSON.parse(data);
      minionStatus = {
        colorLight: {
          status: asJson.ison ? 'on' : 'off' as SwitchOptions,
          blue: asJson.blue || 1,
          red: asJson.red || 1,
          green: asJson.green || 1,
          brightness: asJson.gain || 1,
          temperature: asJson.white || 1
        },
      };
    } else if (deviceType === 'input_event') {
      const asJson = JSON.parse(data);
      const status = asJson.event?.startsWith('S') ? 'on' : 'off' as SwitchOptions;
      minionStatus = {
        toggle: {
          status,
        },
        switch: {
          status,
        },
      };
    } else if (deviceType === 'sensor' && topics?.[3] === 'battery') {
      const asJson = JSON.parse(data);
      // Update devices module about new battery percentage
      this.deviceFeed.post({
        deviceId,
        status: {
          battery: asJson
        }
      });
      // No status to update
      return undefined;
    }

    return {
      id: deviceId,
      minionStatus,
    };
  }
}
