import { DataIO } from '../../../backend/src/data-layer/dataIO';
import { IDataIO } from '../../../backend/src/models/backendInterfaces';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
import { LocalServerSession } from '../models/remoteInterfaces';

const LOCAL_SERVERS_SESSION_FILE_NAME = 'localServersSession.json';

export class LocalServersSessionsDal {

    /** Local servers sessions array. */
    private localServersSessions: LocalServerSession[];

    constructor(private dataIo: IDataIO) {
        this.localServersSessions = dataIo.getDataSync();
    }

    /**
     * Find local server session by local server id.
     */
    private findLocalServerSession(localServerId: string): LocalServerSession {
        for (const localServer of this.localServersSessions) {
            if (localServer.localServerId === localServerId) {
                return localServer;
            }
        }
    }

    /**
     * Get local servers sessions.
     */
    public async getLocalServersSessions(): Promise<LocalServerSession[]> {
        return this.localServersSessions;
    }

    /**
     * Get local server session by local server id.
     */
    public async getLocalServerSessions(localServerId: string): Promise<LocalServerSession> {
        const localServerSession = this.findLocalServerSession(localServerId);

        if (!localServerSession) {
            throw new Error('local server session not exist');
        }
        return localServerSession;
    }

    /**
     * Save new local server session.
     * @param localServerSession local server session to save.
     */
    public async createLocalServerSession(localServerSession: LocalServerSession): Promise<void> {
        this.localServersSessions.push(localServerSession);

        await this.dataIo.setData(this.localServersSessions)
            .catch(() => {
                this.localServersSessions.splice(this.localServersSessions.indexOf(localServerSession), 1);
                throw new Error('fail to save localServer session');
            });
    }

    /**
     * Delete local server session.
     */
    public async deleteLocalServerSession(localServerId: string): Promise<void> {
        const localServer = this.findLocalServerSession(localServerId);

        if (!localServer) {
            throw new Error('localServer session not exist');
        }

        this.localServersSessions.splice(this.localServersSessions.indexOf(localServer), 1);
        await this.dataIo.setData(this.localServersSessions)
            .catch(() => {
                this.localServersSessions.push(localServer);
                throw new Error('fail to save localServer session delete request');
            });
    }
}

export const LocalServersSessionsDalSingleton = new LocalServersSessionsDal(new DataIO(LOCAL_SERVERS_SESSION_FILE_NAME));
