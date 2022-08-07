import { SyncEvent } from 'ts-events';
import { DeviceStatus, Minion, MinionStatus } from '../../../models/sharedInterfaces';

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
  /** Minion Id / Device ID (driver depend @see MqttBaseDriver.deviceIdentity ) */
  id: string;
  minionStatus: MinionStatus;
}

/**
 * Base mqtt messages converter, use to convert from/to casanet client and other device client messages.
 */
export abstract class MqttBaseDriver {

  /** The MQTT topics to listen for a given devise driver */
  public abstract readonly deviceTopics: string | string[];

  /** The identity in use in a given device type driver */
  public abstract readonly deviceIdentity: 'minionId' | 'deviceId';

  /** The devices feed, in case of a update in device physical status, such as battery status */
  protected deviceFeed: SyncEvent<{
    deviceId: string;
    status: DeviceStatus;
  }>;

  /**
   * Init the converter mqtt client.
   */
  public initClient(deviceFeed: SyncEvent<{
    deviceId: string;
    status: DeviceStatus;
  }>) {
    this.deviceFeed = deviceFeed;
  }

  /**
   * Convert casanet set status message to a MQTT message format.
   * @param minion The minion
   * @param setStatus Status to set
   */
  public abstract convertSetStatusMessage(minion: Minion, setStatus: MinionStatus): MqttMessage;

  /**
   * Convert a request for status update to MQTT message format, return undefined if option not supported.
   * @param minion The minion
   */
  public abstract convertRequestStateMessage(minion: Minion): MqttMessage | undefined;

  /**
   * Parse a MQTT incoming message to a Casanet valid status.
   * Return undefined if it's not a valid status update, such as battery status etc.
   * @param topic The message topic.
   * @param data The message payload string.
   */
  public abstract convertMqttMessage(topic: string, data: string): ParsedMqttMessage | undefined;

  /**
   * Check whenever the given topic is belong to the this driver. 
   * @param topic The topic to check
   * @return True if topic belong to the this driver
   */
  public abstract isDeviceMessage(topic: string): boolean;
}
