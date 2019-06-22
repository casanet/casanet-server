import * as mqttapi from 'async-mqtt';
import { MinionStatus } from '../../../models/sharedInterfaces';
import { logger } from '../../../utilities/logger';

/**
 * Message data to send device via mqtt.
 */
export declare interface MqttMessage {
    topic: string;
    data: string;
}

/**
 * Data to get from other device mqtt message.
 */
export declare interface ParsedMqttMessage {
    minionId: string;
    minionStatus: MinionStatus;
}

/**
 * Base mqtt messages converter, use to convert from/to casanet client and other device client messages.
 */
export abstract class MqttConverterBase {

    /** Mqtt client */
    private mqttClient: mqttapi.AsyncMqttClient;

    /** Casanet topic name to subscribe to */
    private readonly casanetSetTopic: string = 'set/casanet/#';
    private readonly casanetGetTopic: string = 'get/casanet/#';

    /** Other device topic to subscribe to */
    protected abstract subscribeDeviceTopic: string;

    /**
     * Init the converter mqtt client.
     */
    public async initClient(brokerUri: string): Promise<MqttConverterBase> {
        this.mqttClient = mqttapi.connect(brokerUri);

        this.mqttClient.on('connect', async () => {

            /** Subscribe to casanet topics */
            await this.mqttClient.subscribe(this.casanetSetTopic);
            await this.mqttClient.subscribe(this.casanetGetTopic);

            /** Subscribe to other device topics */
            await this.mqttClient.subscribe(this.subscribeDeviceTopic);
        });

        this.mqttClient.on('message', async (topic: string, payload: Buffer) => {
            try {
                const topics = topic.split('/');
                const data = payload.toString();

                /** If message sent from casanet to device to set status, convert it and publish it */
                if (topic.indexOf('set/casanet') !== -1) {
                    const minionId = topics[2];
                    const status: MinionStatus = JSON.parse(data);
                    /** Get from child the converted message */
                    const mqttMessage = await this.convertSetStatusToDevice(minionId, status);
                    /** then publish it */
                    await this.mqttClient.publish(mqttMessage.topic, mqttMessage.data);
                    return;
                }

                /** If message sent from casanet to device to get the current status, convert it and publish it */
                if (topic.indexOf('get/casanet') !== -1) {
                    const minionId = topics[2];
                    /** Get from child the converted message */
                    const mqttMessage = await this.convertStatusRequestToDevice(minionId);
                    /** then publish it */
                    await this.mqttClient.publish(mqttMessage.topic, mqttMessage.data);
                    return;
                }

                /** Case the messsage sent from device to casanet, convert the device message to casanet message format */
                const parsedMqttMessage = await this.convertStatusToCasanet(topic, data);
                /** Then publish it */
                await this.mqttClient.publish(`stat/casanet/${parsedMqttMessage.minionId}`, JSON.stringify(parsedMqttMessage.minionStatus));

            } catch (error) {
                logger.warn(`Parsing mqtt message for ${topic}:${payload.toString()} fail ${JSON.stringify(error)}`);
            }
        });

        return this;
    }

    /**
     * Convert casanet set status message to other device mqtt message format.
     * @param minionId minionId.
     * @param setStatus status to set.
     */
    abstract async convertSetStatusToDevice(minionId: string, setStatus: MinionStatus): Promise<MqttMessage>;

    /**
     * Convert casanet get current status message to other device mqtt message format.
     * @param minionId minionId
     */
    abstract async convertStatusRequestToDevice(minionId: string): Promise<MqttMessage>;

    /**
     * Convert device status update message to casanet mqtt message format.
     * @param topic message topic.
     * @param data message data.
     */
    abstract async convertStatusToCasanet(topic: string, data: string): Promise<ParsedMqttMessage>;
}
