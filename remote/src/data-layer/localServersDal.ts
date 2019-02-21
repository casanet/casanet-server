import { DataIO } from '../../../backend/src/data-layer/dataIO';
import { IDataIO } from '../../../backend/src/models/backendInterfaces';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
import { LocalServer } from '../models/sharedInterfaces';

const LOCAL_SERVERS_FILE_NAME = 'localServers.json';

export class LocalServersDal {

    /** Local servers array */
    private localServers: LocalServer[];

    constructor(private dataIo: IDataIO) {
        this.localServers = dataIo.getDataSync();
    }

    /**
     * Find local server by id.
     * @param localServerId local server id.
     */
    private findLocalServer(localServerId: string): LocalServer {
        for (const localServer of this.localServers) {
            if (localServer.localServerId === localServerId) {
                return localServer;
            }
        }
    }

    /**
     * Get local servers arrray.
     */
    public async getLocalServers(): Promise<LocalServer[]> {
        return this.localServers;
    }

    /**
     * Get local server by id.
     */
    public async getLocalServer(localServerId: string): Promise<LocalServer> {
        const localServer = this.findLocalServer(localServerId);

        if (!localServer) {
            throw new Error('local server not exist');
        }
        return localServer;
    }

    /**
     * Save new local server.
     * @param localServer local server to save
     */
    public async createLocalServer(localServer: LocalServer): Promise<void> {
        this.localServers.push(localServer);

        await this.dataIo.setData(this.localServers)
            .catch(() => {
                this.localServers.splice(this.localServers.indexOf(localServer), 1);
                throw new Error('fail to save localServer');
            });
    }

    /**
     * Delete local server by id.
     */
    public async deleteLocalServer(localServerId: string): Promise<void> {
        const localServer = this.findLocalServer(localServerId);

        if (!localServer) {
            throw new Error('local server not exist');
        }

        this.localServers.splice(this.localServers.indexOf(localServer), 1);
        await this.dataIo.setData(this.localServers)
            .catch(() => {
                this.localServers.push(localServer);
                throw new Error('fail to save local server delete request');
            });
    }

    /**
     * Update local server. (simply, replace with given..)
     * @param localServer local server properties update
     */
    public async updateLocalServer(localServer: LocalServer): Promise<void> {

        const originalLocalServer = this.findLocalServer(localServer.localServerId);

        if (!originalLocalServer) {
            throw {
                responseCode : 4004,
                message: 'localServer not exist',
            } as ErrorResponse;
        }

        this.localServers.splice(this.localServers.indexOf(originalLocalServer), 1);
        this.localServers.push(localServer);
        await this.dataIo.setData(this.localServers)
            .catch(() => {
                this.localServers.splice(this.localServers.indexOf(localServer), 1);
                this.localServers.push(originalLocalServer);
                throw new Error('fail to save localServers update request');
            });
    }
}

export const LocalServersDalSingleton = new LocalServersDal(new DataIO(LOCAL_SERVERS_FILE_NAME));
