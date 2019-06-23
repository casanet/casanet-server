import * as mqttapi from 'async-mqtt';
import { DeviceKind, ErrorResponse, Minion, MinionStatus } from '../../models/sharedInterfaces';
import { logger } from '../../utilities/logger';
import { BrandModuleBase } from '../brandModuleBase';
import { MqttConverterBase } from './mqtt-converters/mqttConverterBase';
import { TasmotaConverter } from './mqtt-converters/tasmotaConverter';
import { MqttBroker } from './mqttBroker';

const mqttBrokerUri = process.env.MQTT_BROKER_URI;
const mqttInternalBrokerPort = process.env.MQTT_INTERNAL_BROKER_PORT;

export class MqttHandler extends BrandModuleBase {

    public readonly brandName: string = 'mqtt';

    public readonly devices: DeviceKind[] = [
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'toggle',
            suppotedMinionType: 'toggle',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'switch',
            suppotedMinionType: 'switch',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'air conditioning',
            suppotedMinionType: 'airConditioning',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'light',
            suppotedMinionType: 'light',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'temperature light',
            suppotedMinionType: 'temperatureLight',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'color light',
            suppotedMinionType: 'colorLight',
            isRecordingSupported: false,
        },
        {
            brand: this.brandName,
            isTokenRequierd: false,
            isIdRequierd: false,
            minionsPerDevice: -1,
            model: 'roller',
            suppotedMinionType: 'roller',
            isRecordingSupported: false,
        },
    ];

    private mqttBroker: MqttBroker;
    private mqttClient: mqttapi.AsyncMqttClient;

    private brokerUri: string;

    private mqttConverters: MqttConverterBase[] = [];

    constructor() {
        super();

        this.loadMqttBroker();
    }

    /**
     * Load all mqtt converters
     */
    private async loadMqttConverters() {

        ///////////////////////////////////////////
        ////////// HERE LOAD THE CONVERTERS ///////
        ///////////////////////////////////////////
        this.mqttConverters.push(new TasmotaConverter());

        /** Init converters */
        for (const mqttConverter of this.mqttConverters) {
            await mqttConverter.initClient(this.brokerUri);
        }
    }

    /** Load broker (or init new one if not configurate one) */
    private async loadMqttBroker() {

        /** If there is broker set by env vars */
        if (mqttBrokerUri) {
            this.brokerUri = mqttBrokerUri;
            /** Then load casanet client */
            await this.loadMqttClient();
            return;
        }

        logger.info(`There is no MQTT_BROKER_IP env var, invokeing internal mqtt broker.`);
        this.mqttBroker = new MqttBroker();

        /** Get broker port */
        const internalBrokerPort = mqttInternalBrokerPort
            ? parseInt(mqttInternalBrokerPort, 10)
            : 1883;

        /** Invoke the internal broker and keep the ip */
        const internalBrokerIp = await this.mqttBroker.invokeBroker(internalBrokerPort);

        this.brokerUri = `mqtt://${internalBrokerIp}:${internalBrokerPort}`;
        /** Then load casanet client */
        await this.loadMqttClient();
    }

    /** Load mqtt client */
    private async loadMqttClient() {
        this.mqttClient = mqttapi.connect(this.brokerUri);

        this.mqttClient.on('connect', async () => {
            /** Subscribe to topic that sent to casanet */
            await this.mqttClient.subscribe(`stat/casanet/#`);
        });

        this.mqttClient.on('message', async (topic: string, payload: Buffer) => {
            try {
                /** Extract the minion id from the topic */
                const minionId = topic.split('/')[2];

                /** TODO: check data struct by schema validator. */

                /** Parse the content */
                const status: MinionStatus = JSON.parse(payload.toString());

                /** Get all minions */
                const minions = await this.retrieveMinions.pull();

                /** Find the minion that mention in the message */
                for (const minion of minions) {
                    /**
                     * Find the minions that used current pysical tuya device
                     */
                    if (minion.minionId !== minionId) {
                        continue;
                    }

                    if (!status[minion.minionType]) {
                        logger.warn(`MQTT message for ${topic}:${payload.toString()} data not matchs the minion type`);
                        return;
                    }

                    /** Publish the update to casanet system */
                    this.minionStatusChangedEvent.next({
                        minionId,
                        status,
                    });

                    return;
                }
                logger.debug(`Fail to update minion ${minionId} from mqttt message, minion not exist`);
            } catch (error) {
                logger.warn(`Parsing mqtt message for ${topic}:${payload.toString()} fail ${JSON.stringify(error)}`);
            }
        });

        /** Load the converters */
        await this.loadMqttConverters();
    }

    public async getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse> {
        await this.mqttClient.publish(`get/casanet/${miniom.minionId}`, '');
        /** Current there is no option to 'ask' and wait for respone, only to send request and the update will arrive by status topic. */
        return miniom.minionStatus;
    }

    public async setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse> {
        /** Publish set status topic */
        await this.mqttClient.publish(`set/casanet/${miniom.minionId}`, JSON.stringify(setStatus));
    }

    public async enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        throw {
            responseCode: 6409,
            message: 'the mqtt module not support any recording mode',
        } as ErrorResponse;
    }

    public async generateCommand(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse> {
        throw {
            responseCode: 6409,
            message: 'the mqtt module not support any recording mode',
        } as ErrorResponse;
    }

    public async refreshCommunication(): Promise<void> {
        // There's nothing to do.
    }
}
