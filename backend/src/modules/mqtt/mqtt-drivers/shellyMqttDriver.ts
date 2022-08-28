import { DeviceKind, DeviceStatus, Minion, MinionStatus, SwitchOptions } from '../../../models/sharedInterfaces';
import { MqttBaseDriver, MqttMessage, ParsedMqttMessage } from './mqttBaseDriver';
import * as http from 'http';
import { SyncEvent } from 'ts-events';
import { PullBehavior } from 'pull-behavior';
import { logger } from '../../../utilities/logger';

const { SHELLY_ACTIONS_PORT } = process.env;
export class ShellyMqttDriver extends MqttBaseDriver {

  public readonly brandName: string = 'mqtt-shelly';

  constructor(deviceFeed: SyncEvent<{
    deviceId: string;
    status: DeviceStatus;
  }>, retrieveMinions: PullBehavior<Minion[]>, minionStatusChangedEvent: SyncEvent<{
    minionId: string;
    status: MinionStatus;
  }>) {
    super(deviceFeed, retrieveMinions, minionStatusChangedEvent);

    if (!SHELLY_ACTIONS_PORT) {
      logger.info(`[ShellyMqttDriver] No SHELLY_ACTIONS_PORT provided`);
      return;
    }
    const server = http.createServer(async (...arg) => {
      try {
        await this.actionsListener(...arg);
      } catch (error) {
        logger.warn(`[ShellyMqttDriver] Handing shelly action failed ${error?.message}`);
      }
    });
    server.listen(+SHELLY_ACTIONS_PORT, () => {
      logger.info(`[ShellyMqttDriver] Server is running on http://0.0.0.0:${SHELLY_ACTIONS_PORT}`);
    });
  }

  private async actionsListener(req, res) {
    const urlParts = req?.url?.split?.('/') || [];

    if (urlParts.length < 3) {
      const msg = `Unknown url ${req?.url} params`;
      logger.warn(`[ShellyMqttDriver.actionsListener] ${msg}`)
      res.writeHead(404);
      res.end(msg);
      return;
    }

    const [space, deviceId, status] = urlParts;

    if (!deviceId || !['on', 'off'].includes(status)) {
      const msg = `Invalid url ${req.url} params`;
      logger.warn(`[ShellyMqttDriver.actionsListener] ${msg}`)
      res.writeHead(422);
      res.end(msg);
      return;
    }

    const minions = await this.retrieveMinions.pull();
    const minion = minions.find(m => m.device.deviceId === deviceId);

    if (!minion) {
      const msg = `Unknown device url ${deviceId}`;
      logger.warn(`[ShellyMqttDriver.actionsListener] ${msg}`)
      res.writeHead(503);
      res.end(msg);
      return;
    }

    logger.info(`[ShellyMqttDriver.actionsListener] minion ${minion.minionId} ${minion.name} status update via Shelly actions to ${status}`)

    this.minionStatusChangedEvent.post({
      minionId: minion.minionId,
      status: {
        [minion.minionType]: { ...minion.minionStatus[minion.minionType], status: status }
      }
    });

    res.writeHead(200);
    res.end('DONE');
  }

  public devices: DeviceKind[] = [{
    brand: this.brandName,
    isFetchCommandsAvailable: false,
    isIdRequired: true,
    isRecordingSupported: false,
    isTokenRequired: false,
    minionsPerDevice: 1,
    model: 'MP1',
    supportedMinionType: 'switch'
  }, {
    brand: this.brandName,
    isFetchCommandsAvailable: false,
    isIdRequired: true,
    isRecordingSupported: false,
    isTokenRequired: false,
    minionsPerDevice: 4,
    model: 'MP1 with sensor extension - switch',
    supportedMinionType: 'switch'
  }, {
    brand: this.brandName,
    isFetchCommandsAvailable: false,
    isIdRequired: true,
    isRecordingSupported: false,
    isTokenRequired: false,
    minionsPerDevice: 4,
    model: 'MP1 with sensor extension - the first',
    supportedMinionType: 'temperatureSensor'
  }, {
    brand: this.brandName,
    isFetchCommandsAvailable: false,
    isIdRequired: true,
    isRecordingSupported: false,
    isTokenRequired: false,
    minionsPerDevice: 4,
    model: 'MP1 with sensor extension - the second',
    supportedMinionType: 'temperatureSensor'
  }, {
    brand: this.brandName,
    isFetchCommandsAvailable: false,
    isIdRequired: true,
    isRecordingSupported: false,
    isTokenRequired: false,
    minionsPerDevice: 4,
    model: 'MP1 with sensor extension - the third',
    supportedMinionType: 'temperatureSensor'
  }, {
    brand: this.brandName,
    isFetchCommandsAvailable: false,
    isIdRequired: true,
    isRecordingSupported: false,
    isTokenRequired: false,
    minionsPerDevice: 1,
    model: 'Duo - RGBW',
    supportedMinionType: 'colorLight'
  }, {
    brand: this.brandName,
    isFetchCommandsAvailable: false,
    isIdRequired: true,
    isRecordingSupported: false,
    isTokenRequired: false,
    minionsPerDevice: 1,
    model: 'Button1',
    supportedMinionType: 'toggle'
  }];

  public deviceTopics = [
    'shellies/+/relay/0', // Switches update, such as shelly 1PM
    'shellies/+/color/0/status', // Blob light updates
    'shellies/+/input_event/0', // Button clicked update
    'shellies/+/sensor/battery', // Battery (in percentage) update.
    'shellies/+/ext_temperature/+', // Temperature sensor update.
  ];

  public isDeviceMessage(topic: string): boolean {
    const topics = topic.split('/');
    const publisher = topics?.[0];
    return publisher === 'shellies';
  }

  public convertSetStatusMessage(minion: Minion, setStatus: MinionStatus): MqttMessage[] {
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
        "red": colorLight.red || 1,           /* red brightness, 0..255, applies in mode="color" */
        "green": colorLight.green || 1,         /* green brightness, 0..255, applies in mode="color" */
        "blue": colorLight.blue || 1,        /* blue brightness, 0..255, applies in mode="color" */
        "gain": colorLight.brightness || 1,        /* gain for all channels, 0..100, applies in mode="color" */
        "brightness": colorLight.brightness || 1,  /* brightness, 0..100, applies in mode="white" */
        "white": colorLight.temperature || 1,         /* white brightness, 0..255, applies in mode="color" */
        "temp": 4750,       /* color temperature in K, 3000..6500, applies in mode="white" */
        "effect": 0,        /* applies an effect when set */
        "turn": colorLight.status || 'off',       /* "on", "off" or "toggle" */
        "transition": 500   /* One-shot transition, `0..5000` [ms] */
      });
    }

    return [{
      topic: `shellies/${minion?.device?.deviceId || 'unknown'}/${topic}/0/${command}`,
      data: data,
    }];
  }

  public async getStatus(minion: Minion): Promise<MinionStatus> {

    // For temperature sensor, set hard-coded to be always on
    if (minion.device.brand === this.brandName && minion.minionType === 'temperatureSensor') {
      return {
        temperatureSensor: {
          status: 'on',
          temperature: minion?.minionStatus?.temperatureSensor?.temperature || 0
        }
      }
    }
    return;
  }

  public convertRequestStateMessage(minion: Minion): MqttMessage[] {
    return [];
  }

  public async convertMqttMessage(topic: string, data: string): Promise<ParsedMqttMessage> {
    const topics = topic.split('/');
    const deviceId = topics[1];
    const deviceType = topics[2];


    let minionStatus: MinionStatus;

    let minion: Minion;

    const minions = await this.retrieveMinions.pull();

    if (deviceType === 'relay') {  // case of smart switch as MP1
      minion = minions.find(m => m?.device?.deviceId === deviceId && m?.device?.brand === this.brandName && m?.device?.model === 'MP1');
      minionStatus = {
        switch: {
          status: data.toLowerCase() as SwitchOptions,
        },
      };
    } else if (deviceType === 'color') {
      minion = minions.find(m => m?.device?.deviceId === deviceId);
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
    } else if (deviceType === 'input_event') { // case of button
      minion = minions.find(m => m?.device?.deviceId === deviceId);
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
    } else if (deviceType === 'ext_temperature') { // Case of temp. sensor
      const sensorIndex = topics[3];
      let modelExt: string;
      switch (sensorIndex) {
        case '0':
          modelExt = 'first';
          break;
        case '1':
          modelExt = 'second';
          break;
        case '2':
          modelExt = 'third';
          break;
        default:
          break;
      }
      minion = minions.find(m => m?.device?.deviceId === deviceId && m?.device?.brand === this.brandName && m?.device?.model === `MP1 with sensor extension - the ${modelExt}`);
      const temperature = JSON.parse(data.split(':')[1]);
      minionStatus = {
        temperatureSensor: {
          temperature,
          status: minion?.minionStatus?.['temperatureSensor']?.status || 'on',
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
      minion,
      minionStatus,
    };
  }
}
