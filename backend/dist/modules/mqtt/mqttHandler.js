"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mqttapi = require("async-mqtt");
const logger_1 = require("../../utilities/logger");
const brandModuleBase_1 = require("../brandModuleBase");
const tasmotaConverter_1 = require("./mqtt-converters/tasmotaConverter");
const mqttBroker_1 = require("./mqttBroker");
const mqttBrokerUri = process.env.MQTT_BROKER_URI;
const mqttInternalBrokerPort = process.env.MQTT_INTERNAL_BROKER_PORT;
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
    /**
     * Load all mqtt converters
     */
    async loadMqttConverters() {
        ///////////////////////////////////////////
        ////////// HERE LOAD THE CONVERTERS ///////
        ///////////////////////////////////////////
        this.mqttConverters.push(new tasmotaConverter_1.TasmotaConverter());
        /** Init converters */
        for (const mqttConverter of this.mqttConverters) {
            await mqttConverter.initClient(this.brokerUri);
        }
    }
    /** Load broker (or init new one if not configurate one) */
    async loadMqttBroker() {
        /** If there is broker set by env vars */
        if (mqttBrokerUri) {
            this.brokerUri = mqttBrokerUri;
            /** Then load casanet client */
            await this.loadMqttClient();
            return;
        }
        logger_1.logger.info(`There is no MQTT_BROKER_IP env var, invokeing internal mqtt broker.`);
        this.mqttBroker = new mqttBroker_1.MqttBroker();
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
    async loadMqttClient() {
        this.mqttClient = mqttapi.connect(this.brokerUri);
        this.mqttClient.on('connect', async () => {
            /** Subscribe to topic that sent to casanet */
            await this.mqttClient.subscribe(`stat/casanet/#`);
        });
        this.mqttClient.on('message', async (topic, payload) => {
            try {
                /** Extract the minion id from the topic */
                const minionId = topic.split('/')[2];
                /** TODO: check data struct by schema validator. */
                /** Parse the content */
                const status = JSON.parse(payload.toString());
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
                        logger_1.logger.warn(`MQTT message for ${topic}:${payload.toString()} data not matchs the minion type`);
                        return;
                    }
                    /** Publish the update to casanet system */
                    this.minionStatusChangedEvent.next({
                        minionId,
                        status,
                    });
                    return;
                }
                logger_1.logger.debug(`Fail to update minion ${minionId} from mqttt message, minion not exist`);
            }
            catch (error) {
                logger_1.logger.warn(`Parsing mqtt message for ${topic}:${payload.toString()} fail ${JSON.stringify(error)}`);
            }
        });
        /** Load the converters */
        await this.loadMqttConverters();
    }
    async getStatus(miniom) {
        await this.mqttClient.publish(`get/casanet/${miniom.minionId}`, '');
        /** Current there is no option to 'ask' and wait for respone, only to send request and the update will arrive by status topic. */
        return miniom.minionStatus;
    }
    async setStatus(miniom, setStatus) {
        /** Publish set status topic */
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
    async setFetchedCommands(minion, commandsSet) {
        // There's nothing to do.
    }
    async refreshCommunication() {
        // There's nothing to do.
    }
}
exports.MqttHandler = MqttHandler;
//# sourceMappingURL=mqttHandler.js.map