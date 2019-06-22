"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mqttapi = require("async-mqtt");
const logger_1 = require("../../../utilities/logger");
/**
 * Base mqtt messages converter, use to convert from/to casanet client and other device client messages.
 */
class MqttConverterBase {
    constructor() {
        /** Casanet topic name to subscribe to */
        this.casanetSetTopic = 'set/casanet/#';
        this.casanetGetTopic = 'get/casanet/#';
    }
    /**
     * Init the converter mqtt client.
     */
    async initClient(brokerIp, brokerPort) {
        this.mqttClient = mqttapi.connect(`tcp://${brokerIp}:${brokerPort}`);
        this.mqttClient.on('connect', async () => {
            /** Subscribe to casanet topics */
            await this.mqttClient.subscribe(this.casanetSetTopic);
            await this.mqttClient.subscribe(this.casanetGetTopic);
            /** Subscribe to other device topics */
            await this.mqttClient.subscribe(this.subscribeDeviceTopic);
        });
        this.mqttClient.on('message', async (topic, payload) => {
            try {
                const topics = topic.split('/');
                const data = payload.toString();
                /** If message sent from casanet to device to set status, convert it and publish it */
                if (topic.indexOf('set/casanet') !== -1) {
                    const minionId = topics[2];
                    const status = JSON.parse(data);
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
            }
            catch (error) {
                logger_1.logger.warn(`Parsing mqtt message for ${topic}:${payload.toString()} fail ${JSON.stringify(error)}`);
            }
        });
        return this;
    }
}
exports.MqttConverterBase = MqttConverterBase;
//# sourceMappingURL=mqttConverterBase.js.map