import { DeviceKind, Minion, MinionStatus, SwitchOptions } from '../../../models/sharedInterfaces';
import { MqttBaseDriver, MqttMessage, ParsedMqttMessage } from './mqttBaseDriver';
import { 
  normalizeFromPercents, 
} from 'percent-normalizer';

export class TasmotaMqttDriver extends MqttBaseDriver {

  public readonly brandName: string[] = ['mqtt-tasmota'];

  public devices: DeviceKind[] = [{
    brand: this.brandName[0],
    isFetchCommandsAvailable: false,
    isIdRequired: true,
    isRecordingSupported: false,
    isTokenRequired: false,
    minionsPerDevice: 1,
    model: 'switch',
    supportedMinionType: 'switch'
  }, {
    brand: this.brandName[0],
    isFetchCommandsAvailable: false,
    isIdRequired: true,
    isRecordingSupported: false,
    isTokenRequired: false,
    minionsPerDevice: 1,
    model: 'color light',
    supportedMinionType: 'colorLight'
  }];

  public deviceTopics = [
    'stat/+/RESULT'
  ];

  public isDeviceMessage(topic: string): boolean {
    const topics = topic.split('/');
    const domain = topics?.[0];
    return domain.startsWith('stat');
  }

  public convertSetStatusMessage(minion: Minion, setStatus: MinionStatus): MqttMessage[] {

    const baseMqttMessage: MqttMessage[] = [{
      topic: `cmnd/${minion?.device?.deviceId || 'unknown'}/POWER`,
      data: setStatus?.[minion.minionType]?.status?.toUpperCase?.(),
    }];

    if (minion.minionType === 'colorLight' && setStatus?.colorLight?.status === 'on') {
      const setLight = setStatus.colorLight;

      // If brightness changes, calculate the the new RGB to set.
      // Since tasmota calculates brightness on RGB mode, from the RGB values.
      if (setLight.brightness !== minion.minionStatus.colorLight.brightness) {
        const brightnessDiff = (setLight.brightness ?? 100) - (minion.minionStatus.colorLight.brightness ?? 100);
        const normalizedToRGBBrightnessDiff = normalizeFromPercents({
          value: brightnessDiff,
          topRangeBorder: 255,
          bottomRangeBorder: 1
        });
        // Adjust as the diff, with min 0 max 255.
        setLight.red = Math.round(Math.max(Math.min(setLight.red + normalizedToRGBBrightnessDiff, 255), 0));
        setLight.green = Math.round(Math.max(Math.min(setLight.green + normalizedToRGBBrightnessDiff, 255), 0));
        setLight.blue = Math.round(Math.max(Math.min(setLight.blue + normalizedToRGBBrightnessDiff, 255), 0));
      }

      baseMqttMessage.push({
        topic: `cmnd/${minion?.device?.deviceId || 'unknown'}/Color`,
        data: `${(setLight.red).toString(16).padStart(2, '0')}${(setLight.green).toString(16).padStart(2, '0')}${(setLight.blue).toString(16).padStart(2, '0')}`
      });
    }
    return baseMqttMessage
  }

  public convertRequestStateMessage(minion: Minion): MqttMessage[] {

    const queries: MqttMessage[] = [{
      topic: `cmnd/${minion?.device?.deviceId || 'unknown'}/POWER`,
      data: '',
    }];

    if (minion.minionType === 'colorLight') {
      queries.push({
        topic: `cmnd/${minion?.device?.deviceId || 'unknown'}/COLOR`,
        data: '',
      });
    }

    return queries;
  }

  public async getStatus(minion: Minion): Promise<MinionStatus> {
    return;
  }

  public async convertMqttMessage(topic: string, data: string): Promise<ParsedMqttMessage> {
    const topics = topic.split('/');
    const deviceId = topics[1];

    const minions = await this.retrieveMinions.pull();
    const minion = minions.find(m => m?.device?.deviceId === deviceId);

    let minionStatus: MinionStatus;


    if (minion?.minionType === 'switch') {
      const asJson = JSON.parse(data);
      minionStatus = {
        switch: {
          status: asJson?.POWER?.toLowerCase() || 'off' as SwitchOptions,
        },
      };
    } else if (minion?.minionType === 'colorLight') {
      const asJson = JSON.parse(data);

      minionStatus = {
        colorLight: {
          status: asJson?.POWER?.toLowerCase() || minion?.minionStatus?.colorLight?.status || 'off',
          brightness: (asJson?.Dimmer || 1) ?? minion?.minionStatus?.colorLight?.brightness ?? 1,
          temperature: minion?.minionStatus?.colorLight?.temperature || 1, // NOT SUPPORTED YET
          red: (!asJson?.Color ? minion?.minionStatus?.colorLight?.red : parseInt(asJson.Color.substring(0, 2), 16)) || 1,
          green: (!asJson?.Color ? minion?.minionStatus?.colorLight?.green : parseInt(asJson.Color.substring(2, 4), 16)) || 1,
          blue: (!asJson?.Color ? minion?.minionStatus?.colorLight?.blue : parseInt(asJson.Color.substring(4, 6), 16)) || 1,
        },
      };
    }

    return {
      minion,
      minionStatus,
    };
  }
}
