import { MinionStatus, SwitchOptions } from '../../../models/sharedInterfaces';
import { MqttConverterBase, MqttMessage, ParsedMqttMessage } from './mqttConverterBase';

export class TasmotaConverter extends MqttConverterBase {

    /**
     * Let abstract know the tasmota topic
     * (After changing by tasmota web interface the topic to 'sonoff/[minionId]')
     */
    protected subscribeDeviceTopic = 'stat/sonoff/+/POWER';

    public async convertToDevice(minionId: string, setStatus: MinionStatus): Promise<MqttMessage> {
        return {
            topic: `cmnd/sonoff/${minionId}/POWER`,
            data: setStatus.switch.status.toUpperCase(),
        };
    }

    public async convertToCasanet(topic: string, data: string): Promise<ParsedMqttMessage> {
        const topics = topic.split('/');
        const minionId = topics[2];

        const minionStatus: MinionStatus = {
            switch: {
                status: data.toLowerCase() as SwitchOptions,
            },
        };
        return {
            minionId,
            minionStatus,
        };
    }
}
