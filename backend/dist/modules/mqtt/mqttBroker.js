"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ip = require("ip");
const mosca = require("mosca");
const logger_1 = require("../../utilities/logger");
/** Simple Mqtt server */
class MqttBroker {
    constructor() { }
    /**
     * Init broker
     * @param port broker listening port.
     * @returns  The broker ip.
     */
    async invokeBroker(port) {
        this.server = new mosca.Server({
            port,
        });
        this.server.on('ready', () => {
            logger_1.logger.info(`Mosca mqtt server on ${ip.address()}:${port} is up and running`);
        });
        this.server.on('clientConnected', client => {
            logger_1.logger.info(`Mqtt ${client.id} client connected`);
        });
        return ip.address();
    }
}
exports.MqttBroker = MqttBroker;
//# sourceMappingURL=mqttBroker.js.map