import { RemoteSettings } from '../../../src/models/sharedInterfaces';

export class RemoteConnectionDalMock {
  public mockSettings: RemoteSettings = {
    host: 'ws://127.0.0.1',
    connectionKey: '1234567890',
  };

  public async getRemoteSettings(): Promise<RemoteSettings> {
    return this.mockSettings;
  }

  public async deleteRemoteSettings(): Promise<void> {
    this.mockSettings = undefined;
  }

  public async setRemoteSettings(remoteSettings: RemoteSettings): Promise<void> {
    this.mockSettings = remoteSettings;
  }
}
