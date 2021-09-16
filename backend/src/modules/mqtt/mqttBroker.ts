import * as ip from 'ip';
import * as aedes from 'aedes';
import { createServer } from 'aedes-server-factory';
import { logger } from '../../utilities/logger';
import { Server } from 'net';

/** Simple Mqtt server */
export class MqttBroker {
  private server: Server;

  constructor() {}

  /**
   * Init broker
   * @param port broker listening port.
   * @returns  The broker ip.
   */
  public async invokeBroker(port: number): Promise<string> {
		this.server = createServer(aedes.Server());
		
		this.server.listen(port, () => {
      logger.info(`[MqttBroker] aedes mqtt server on ${ip.address()}:${port} is up and running`);
		});
		this.server.on('close' ,() => {
      logger.warn(`[MqttBroker] aedes mqtt server  ${ip.address()}:${port} is closed`);
		});
		this.server.on('connection' ,() => {
      logger.warn(`[MqttBroker] aedes mqtt server  ${ip.address()}:${port} connection arrived`);
		});
		this.server.on('error' ,() => {
      logger.warn(`[MqttBroker] aedes mqtt server  ${ip.address()}:${port} got error`);
		});

    return ip.address();
  }
}
