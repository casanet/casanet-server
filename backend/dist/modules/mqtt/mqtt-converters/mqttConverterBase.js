"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mqttapi = require("async-mqtt");
const logger_1 = require("../../../utilities/logger");
class MqttConverterBase {
    constructor() {
        this.casanetTopic = 'set/casanet/#';
    }
    async initClient(brokerIp, brokerPort) {
        this.mqttClient = mqttapi.connect(`tcp://${brokerIp}:${brokerPort}`);
        this.mqttClient.on('connect', async () => {
            /** Subscribe to casanet topics */
            await this.mqttClient.subscribe(this.casanetTopic);
            /** Subscribe to device topics */
            await this.mqttClient.subscribe(this.subscribeDeviceTopic);
        });
        this.mqttClient.on('message', async (topic, payload) => {
            try {
                const topics = topic.split('/');
                const data = payload.toString();
                if (topic.indexOf('set/casanet') !== -1) {
                    const minionId = topics[2];
                    const status = JSON.parse(data);
                    const mqttMessage = await this.topicToPublish(minionId, status);
                    await this.mqttClient.publish(mqttMessage.topic, mqttMessage.data);
                    return;
                }
                const parsedMqttMessage = await this.topicToParse(topic, data);
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