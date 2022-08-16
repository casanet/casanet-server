import { PullBehavior } from 'pull-behavior';
import { SyncEvent } from 'ts-events';
import { DeviceKind, DeviceStatus, Minion, MinionStatus } from '../../../models/sharedInterfaces';

/**
 * Message data to send to a device via mqtt.
 */
export declare interface MqttMessage {
  topic: string;
  data: string;
}

/**
 * Data arrived from a device using mqtt message.
 */
export declare interface ParsedMqttMessage {
  minion: Minion;
  minionStatus: MinionStatus;
}

/**
 * Base mqtt messages converter, use to convert from/to casanet client and other device client messages.
 */
export abstract class MqttBaseDriver {

  /**
   * Brand name, should be unique in system with format as `mqtt-XXXX`.
   */
  public abstract readonly brandName: string[];

  /**
   * All supported devices via current driver metadata.
   */
  public abstract readonly devices: DeviceKind[];

  /** The MQTT topics to listen for a given devise driver */
  public abstract readonly deviceTopics: string | string[];


  /**
   * Init the converter mqtt client.
   */
  public constructor(protected deviceFeed: SyncEvent<{
    deviceId: string;
    status: DeviceStatus;
  }>, protected retrieveMinions: PullBehavior<Minion[]>) {
  }

  /**
   * Convert casanet set status message to a MQTT messages collection format.
   * @param minion The minion
   * @param setStatus Status to set
   */
  public abstract convertSetStatusMessage(minion: Minion, setStatus: MinionStatus): MqttMessage[];

  /**
   * Convert a request for status update to MQTT message format, return undefined if option not supported.
   * @param minion The minion
   */
  public abstract convertRequestStateMessage(minion: Minion): MqttMessage[];

  /**
   * Get status, if possible.
   * @param minion The minion
   */
  public abstract getStatus(minion: Minion): Promise<MinionStatus | undefined>;

  /**
   * Parse a MQTT incoming message to a Casanet valid status.
   * Return undefined if it's not a valid status update, such as battery status etc.
   * @param topic The message topic.
   * @param data The message payload string.
   */
  public abstract convertMqttMessage(topic: string, data: string): Promise<ParsedMqttMessage>;

  /**
   * Check whenever the given topic is belong to the this driver. 
   * @param topic The topic to check
   * @return True if topic belong to the this driver
   */
  public abstract isDeviceMessage(topic: string): boolean;
}
