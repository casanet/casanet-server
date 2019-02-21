import { Configuration } from '../config';
import { IDataIO } from '../models/backendInterfaces';
import { ErrorResponse, RemoteSettings, User } from '../models/sharedInterfaces';
import { DataIO } from './dataIO';

const REMOTE_CONN_FILE_NAME = 'remoteConnection.json';

export class RemoteConnectionDal {

    private dataIo: IDataIO;

    /**
     * remoteSettings.
     */
    private remoteSettings: RemoteSettings[];

    constructor(dataIo: IDataIO) {
        this.dataIo = dataIo;

        this.remoteSettings = dataIo.getDataSync();
    }

    /**
     * Get remote settings.
     */
    public async getRemoteSettings(): Promise<RemoteSettings> {
        return this.remoteSettings.length > 0 ? this.remoteSettings[0] : undefined;
    }

    /**
     * Delete remote settings.
     */
    public async deleteRemoteSettings(): Promise<void> {
        this.remoteSettings = [];

        await this.dataIo.setData(this.remoteSettings)
            .catch(() => {
                throw new Error('fail to save remote settings delete request');
            });
    }

    /**
     * Set remote settings (and remove current).
     * @param remoteSettings remote settings to save.
     */
    public async setRemoteSettings(remoteSettings: RemoteSettings): Promise<void> {

        this.remoteSettings = [remoteSettings];

        await this.dataIo.setData(this.remoteSettings)
            .catch(() => {
                throw new Error('fail to save set remote settings request');
            });
    }
}

export const RemoteConnectionDalSingleton = new RemoteConnectionDal(new DataIO(REMOTE_CONN_FILE_NAME));
