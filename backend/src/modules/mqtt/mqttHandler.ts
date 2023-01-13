import * as mqttapi from 'async-mqtt';
import { Duration } from 'unitsnet-js';
import { CommandsSet } from '../../models/backendInterfaces';
import { DeviceKind, ErrorResponse, Minion, MinionStatus } from '../../models/sharedInterfaces';
import { logger } from '../../utilities/logger';
import { sleep } from '../../utilities/sleep';
import { BrandModuleBase } from '../brandModuleBase';
import { CasanetMqttDriver } from './mqtt-drivers/casanetMqttDriver';
import { MqttBaseDriver } from './mqtt-drivers/mqttBaseDriver';
import { ShellyMqttDriver } from './mqtt-drivers/shellyMqttDriver';
import { TasmotaMqttDriver } from './mqtt-drivers/tasmotaMqttDriver';
import { MqttBroker } from './mqttBroker';

const mqttBrokerUri = process.env.MQTT_BROKER_URI;
const mqttInternalBrokerPort = process.env.MQTT_INTERNAL_BROKER_PORT;

export class MqttHandler extends BrandModuleBase {
  public brandName: string[] = ['mqtt'];

  public devices: DeviceKind[] = [
    {
      brand: this.brandName[0],
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'toggle',
      supportedMinionType: 'toggle',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName[0],
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'switch',
      supportedMinionType: 'switch',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName[0],
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'air conditioning',
      supportedMinionType: 'airConditioning',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName[0],
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'light',
      supportedMinionType: 'light',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName[0],
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'temperature light',
      supportedMinionType: 'temperatureLight',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName[0],
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'color light',
      supportedMinionType: 'colorLight',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName[0],
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'roller',
      supportedMinionType: 'roller',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
    {
      brand: this.brandName[0],
      isTokenRequired: false,
      isIdRequired: true,
      minionsPerDevice: -1,
      model: 'temperature sensor',
      supportedMinionType: 'temperatureSensor',
      isRecordingSupported: false,
      isFetchCommandsAvailable: false,
    },
  ];

  private mqttBroker: MqttBroker;
  private mqttClient: mqttapi.AsyncMqttClient;

  private brokerUri: string;

  private mqttDrivers: MqttBaseDriver[] = [];
  // Map drivers by brand name
  private mqttDriversMap: { [key in string]: MqttBaseDriver } = {};

  constructor() {
    super();
    this.loadMqttBroker();
  }

  public async getStatus(minion: Minion): Promise<MinionStatus | ErrorResponse> {
    const mqttDriver = this.mqttDriversMap[minion.device.brand] || this.mqttDriversMap['mqtt-casanet'];
    const messages = mqttDriver.convertRequestStateMessage(minion);
    for (const message of messages) {
      await this.mqttClient.publish(message.topic, message.data);
    }
    const status = await mqttDriver.getStatus(minion);
    if (status) {
      return status;
    }
    /** Current mustily there is no option to 'ask' and wait for response, only to send request and the update will arrive by status topic. */
    return minion.minionStatus;
  }

  public async setStatus(minion: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
    /** Publish set status topic */
    const mqttDriver = this.mqttDriversMap[minion.device.brand] || this.mqttDriversMap['mqtt-casanet'];
    const messages = mqttDriver.convertSetStatusMessage(minion, setStatus);
    for (const message of messages) {
      await this.mqttClient.publish(message.topic, message.data);
      // If there is several topics to sent to set the correct status, give grace of half-seconds between
      if (messages.length > 1) {
        await sleep(Duration.FromSeconds(0.5));
      }
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
    this.mqttDrivers = [];

    ///////////////////////////////////////////
    ////////// HERE LOAD THE DERIVER //////////
    ///////////////////////////////////////////
    this.mqttDrivers.push(new CasanetMqttDriver(this.deviceStatusChangedEvent, this.retrieveMinions, this.minionStatusChangedEvent));
    this.mqttDrivers.push(new ShellyMqttDriver(this.deviceStatusChangedEvent, this.retrieveMinions, this.minionStatusChangedEvent));
    this.mqttDrivers.push(new TasmotaMqttDriver(this.deviceStatusChangedEvent, this.retrieveMinions, this.minionStatusChangedEvent));

    /** Init converters */
    for (const mqttDriver of this.mqttDrivers) {
      this.devices.push(...mqttDriver.devices);
      this.brandName.push(mqttDriver.brandName);
      this.mqttDriversMap[mqttDriver.brandName] = mqttDriver;
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
      logger.info(`[MqttHandler.connect] MQTT broker is connect`);
      /** Subscribe to topic all of drivers */
      for (const mqttDriver of this.mqttDrivers) {
        await this.mqttClient.subscribe(mqttDriver.deviceTopics);
      }
    });

    this.mqttClient.on('offline', async () => {
      logger.warn(`[MqttHandler.offline] MQTT broker is offline`);
    });

    this.mqttClient.on('disconnect', async () => {
      logger.warn(`[MqttHandler.disconnect] MQTT broker is disconnect`);
    });

    this.mqttClient.on('end', async () => {
      logger.warn(`[MqttHandler.end] MQTT broker is end`);
    });

    this.mqttClient.on('error', async () => {
      logger.warn(`[MqttHandler.error] MQTT broker is error`);
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

        const parsedMqttMessage = await mqttDriver.convertMqttMessage(topic, messageData);

        if (!parsedMqttMessage) {
          logger.info(`[MqttHandler.onMessage] "${topic}" is not a ${mqttDriver.brandName} status message`);
          return;
        }


        if (!parsedMqttMessage.minion) {
          logger.warn(`[MqttHandler.onMessage] Fail to update minion status from MQTT message, minion/device not exist`);
          return;
        }

        if (!parsedMqttMessage.minionStatus[parsedMqttMessage.minion.minionType]) {
          logger.warn(`[MqttHandler.onMessage] Message topic ${topic} for minion ${parsedMqttMessage.minion.minionId} contained invalid status payload "${messageData}", aborting...`);
          return;
        }

        /** Publish the update to casanet system */
        this.minionStatusChangedEvent.post({
          minionId: parsedMqttMessage.minion.minionId,
          status: {
            [parsedMqttMessage.minion.minionType]: parsedMqttMessage.minionStatus[parsedMqttMessage.minion.minionType]
          }
        });

      } catch (error) {
        logger.error(`[MqttHandler.onMessage] Parsing mqtt message for ${topic}:${payload?.toString?.()} failed, error: ${JSON.stringify(error)}`);
      }
    });
  }
}
