import * as ip from 'ip';
import * as mosca from 'mosca';
import { logger } from '../../utilities/logger';

/** Simple Mqtt server */
export class MqttBroker {
  private server: mosca.Server;

  constructor() {}

  /**
   * Init broker
   * @param port broker listening port.
   * @returns  The broker ip.
   */
  public async invokeBroker(port: number): Promise<string> {
    this.server = new mosca.Server({
      port,
    });

    this.server.on('ready', () => {
      logger.info(`Mosca mqtt server on ${ip.address()}:${port} is up and running`);
    });

    this.server.on('clientConnected', client => {
      logger.info(`Mqtt ${client.id} client connected`);
    });

    return ip.address();
  }
}
