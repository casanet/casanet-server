"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mqttConverterBase_1 = require("./mqttConverterBase");
class TasmotaConverter extends mqttConverterBase_1.MqttConverterBase {
    constructor() {
        super(...arguments);
        this.subscribeDeviceTopic = 'stat/sonoff/+/POWER';
    }
    async topicToPublish(minionId, setStatus) {
        return {
            topic: `cmnd/sonoff/${minionId}/POWER`,
            data: setStatus.switch.status.toUpperCase(),
        };
    }
    async topicToParse(topic, data) {
        const topics = topic.split('/');
        const minionId = topics[2];
        const minionStatus = {
            switch: {
                status: data.toLowerCase(),
            },
        };
        return {
            minionId,
            minionStatus,
        };
    }
}
exports.TasmotaConverter = TasmotaConverter;
//# sourceMappingURL=tasmota.js.map