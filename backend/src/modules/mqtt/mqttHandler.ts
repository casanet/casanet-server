import * as mqttapi from 'async-mqtt';
import { CommandsSet } from '../../models/backendInterfaces';
import { DeviceKind, ErrorResponse, Minion, MinionStatus } from '../../models/sharedInterfaces';
import { logger } from '../../utilities/logger';
import { BrandModuleBase } from '../brandModuleBase';
import { CasanetMqttDriver } from './mqtt-drivers/casanetMqttDriver';
import { MqttBaseDriver } from './mqtt-drivers/mqttBaseDriver';
import { ShellyMqttDriver } from './mqtt-drivers/shellyMqttDriver';
import { TasmotaMqttDriver } from './mqtt-drivers/tasmotaMqttDriver';
import { MqttBroker } from './mqttBroker';

const mqttBrokerUri = process.env.MQTT_BROKER_URI;
const mqttInternalBrokerPort = process.env.MQTT_INTERNAL_BROKER_PORT;

export class MqttHandler extends BrandModuleBase {
  public readonly brandName: string = 'mqtt';

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

  private mqttBroker: MqttBroker;
  private mqttClient: mqttapi.AsyncMqttClient;

  private brokerUri: string;

  private mqttDrivers: MqttBaseDriver[] = [];

  constructor() {
    super();
    this.loadMqttBroker();
  }

  public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    for (const mqttDriver of this.mqttDrivers) {
      const message = mqttDriver.convertRequestStateMessage(minion);
      if (message) {
        await this.mqttClient.publish(message.topic, message.data);
      }
    }
    /** Current there is no option to 'ask' and wait for respone, only to send request and the update will arrive by status topic. */
    return minion.minionStatus;
  }

  public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    /** Publish set status topic */
    for (const mqttDriver of this.mqttDrivers) {
      const message = mqttDriver.convertSetStatusMessage(minion, setStatus);
      await this.mqttClient.publish(message.topic, message.data);
    }
  }

  public async enterRecordMode(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    throw {
      responseCode: 6409,
      message: 'the mqtt module not support any recording mode',
    } as ErrorResponse;
  }

  public async generateCommand(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
    throw {
      responseCode: 6409,
      message: 'the mqtt module not support any recording mode',
    } as ErrorResponse;
  }

  public async setFetchedCommands(minion: Minion, commandsSet: CommandsSet): Promise<void | ErrorResponse> {
    // There's nothing to do.
  }

  public async refreshCommunication(): Promise<void> {
    // There's nothing to do.
  }

  /**
   * Load all mqtt converters
   */
  private async loadMqttDrivers() {
    ///////////////////////////////////////////
    ////////// HERE LOAD THE DERIVER //////////
    ///////////////////////////////////////////
    this.mqttDrivers.push(new CasanetMqttDriver());
    this.mqttDrivers.push(new ShellyMqttDriver());
    this.mqttDrivers.push(new TasmotaMqttDriver());

    /** Init converters */
    for (const mqttConverter of this.mqttDrivers) {
      mqttConverter.initClient(this.deviceStatusChangedEvent);
    }
  }

  /** Load broker (or init new one if not configured one) */
  private async loadMqttBroker() {
    /** If there is broker set by env vars */
    if (mqttBrokerUri) {
      this.brokerUri = mqttBrokerUri;
      /** Then load casanet client */
      await this.loadMqttClient();
      return;
    }

    logger.info(`There is no MQTT_BROKER_IP env var, invoking internal mqtt broker.`);
    this.mqttBroker = new MqttBroker();

    /** Get broker port */
    const internalBrokerPort = mqttInternalBrokerPort ? parseInt(mqttInternalBrokerPort, 10) : 1883;

    /** Invoke the internal broker and keep the ip */
    const internalBrokerIp = await this.mqttBroker.invokeBroker(internalBrokerPort);

    this.brokerUri = `mqtt://${internalBrokerIp}:${internalBrokerPort}`;
    /** Then load casanet client */
    await this.loadMqttClient();
  }

  /** Load mqtt client */
  private async loadMqttClient() {

    /** Load the drivers */
    this.loadMqttDrivers();

    this.mqttClient = mqttapi.connect(this.brokerUri);

    this.mqttClient.on('connect', async () => {
      /** Subscribe to topic all of drivers */
      for (const mqttDriver of this.mqttDrivers) {
        await this.mqttClient.subscribe(mqttDriver.deviceTopics);
      }
    });

    this.mqttClient.on('message', async (topic: string, payload: Buffer) => {
      try {

        // Once a message arrived, find the driver that going to handle it
        const mqttDriver = this.mqttDrivers.find(mqttDriver => mqttDriver.isDeviceMessage(topic));

        if (!mqttDriver) {
          logger.warn(`[MqttHandler.onMessage] No MQTT driver found to handle message topic "${topic}"`)
          return;
        }

        const messageData = payload?.toString?.() || '';

        const parsedMqttMessage = mqttDriver.convertMqttMessage(topic, messageData);

        /** Get all minions */
        const minions = await this.retrieveMinions.pull();

        const minion = minions.find(m => {
          if (mqttDriver.deviceIdentity === 'minionId') {
            return m?.minionId === parsedMqttMessage.id;
          }

          return m?.device?.deviceId === parsedMqttMessage.id
        });

        if (!minion) {
          logger.warn(`[MqttHandler.onMessage] Fail to update minion ${parsedMqttMessage.id} from MQTT message, minion/device not exist`);
          return;
        }

        if (!parsedMqttMessage.minionStatus[minion.minionType]) {
          logger.warn(`[MqttHandler.onMessage] Message topic ${topic} for minion ${minion.minionId} contained invalid status payload "${messageData}", aborting...`);
          return;
        }

        /** Publish the update to casanet system */
        this.minionStatusChangedEvent.post({
          minionId: parsedMqttMessage.id,
          status: {
            [minion.minionType]: parsedMqttMessage.minionStatus[minion.minionType]
          }
        });

      } catch (error) {
        logger.error(`[MqttHandler.onMessage] Parsing mqtt message for ${topic}:${payload?.toString?.()} failed, error: ${JSON.stringify(error)}`);
      }
    });
  }
}
