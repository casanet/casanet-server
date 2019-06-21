"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mqttapi = require("async-mqtt");
const logger_1 = require("../../utilities/logger");
const brandModuleBase_1 = require("../brandModuleBase");
const tasmota_1 = require("./mqtt-converters/tasmota");
const mqttBroker_1 = require("./mqttBroker");
const mqttBrokerIp = process.env.MQTT_BROKER_IP;
const mqttBrokerPort = process.env.MQTT_BROKER_PORT;
class MqttHandler extends brandModuleBase_1.BrandModuleBase {
    constructor() {
        super();
        this.brandName = 'mqtt';
        this.devices = [
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
        this.mqttConverters = [];
        this.loadMqttBroker();
    }
    async loadMqttConverters() {
        this.mqttConverters.push(new tasmota_1.TasmotaConverter());
        for (const mqttConverter of this.mqttConverters) {
            await mqttConverter.initClient(this.brokerIp, this.brokerPort);
        }
    }
    async loadMqttBroker() {
        this.brokerPort = mqttBrokerPort
            ? parseInt(mqttBrokerPort, 10)
            : 1883;
        if (mqttBrokerIp) {
            this.brokerIp = mqttBrokerIp;
            await this.loadMqttClient();
            return;
        }
        logger_1.logger.info(`There is no MQTT_BROKER_IP env var, invokeing internal mqtt broker.`);
        this.mqttBroker = new mqttBroker_1.MqttBroker();
        /** Invoke the internal broker and keep the ip */
        this.brokerIp = await this.mqttBroker.invokeBroker(this.brokerPort);
        await this.loadMqttClient();
    }
    async loadMqttClient() {
        this.mqttClient = mqttapi.connect(`tcp://${this.brokerIp}:${this.brokerPort}`);
        this.mqttClient.on('connect', async () => {
            await this.mqttClient.subscribe(`stat/casanet/#`);
        });
        this.mqttClient.on('message', async (topic, payload) => {
            try {
                const minionId = topic.split('/')[2];
                const status = JSON.parse(payload.toString());
                const minions = await this.retrieveMinions.pull();
                for (const minion of minions) {
                    /**
                     * Find the minions that used current pysical tuya device
                     */
                    if (minion.minionId !== minionId) {
                        continue;
                    }
                    this.minionStatusChangedEvent.next({
                        minionId,
                        status,
                    });
                    return;
                }
                logger_1.logger.debug(`Fil to update minion ${minionId} from mqttt message, minion not exist`);
            }
            catch (error) {
                logger_1.logger.warn(`Parsing mqtt message for ${topic}:${payload.toString()} fail ${JSON.stringify(error)}`);
            }
        });
        await this.loadMqttConverters();
    }
    async getStatus(miniom) {
        return miniom.minionStatus;
    }
    async setStatus(miniom, setStatus) {
        await this.mqttClient.publish(`set/casanet/${miniom.minionId}`, JSON.stringify(setStatus));
    }
    async enterRecordMode(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the mqtt module not support any recording mode',
        };
    }
    async generateCommand(miniom, statusToRecordFor) {
        throw {
            responseCode: 6409,
            message: 'the mqtt module not support any recording mode',
        };
    }
    async refreshCommunication() {
        // There's nothing to do.
    }
}
exports.MqttHandler = MqttHandler;
//# sourceMappingURL=mqttHandler.js.map