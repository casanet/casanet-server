"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mqttConverterBase_1 = require("./mqttConverterBase");
class TasmotaConverter extends mqttConverterBase_1.MqttConverterBase {
    constructor() {
        super(...arguments);
        /**
         * Let abstract know the tasmota topic
         * (After changing by tasmota web interface the topic to 'sonoff/[minionId]')
         */
        this.subscribeDeviceTopic = 'stat/sonoff/+/POWER';
    }
    async convertSetStatusToDevice(minionId, setStatus) {
        return {
            topic: `cmnd/sonoff/${minionId}/POWER`,
            data: setStatus.switch.status.toUpperCase(),
        };
    }
    async convertStatusRequestToDevice(minionId) {
        return {
            topic: `cmnd/sonoff/${minionId}/POWER`,
            data: '',
        };
    }
    async convertStatusToCasanet(topic, data) {
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
//# sourceMappingURL=tasmotaConverter.js.map