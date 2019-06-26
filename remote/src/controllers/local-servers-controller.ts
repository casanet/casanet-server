import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
import { LocalServer, ServerSession } from '../models';
import { getServers, getServer, createServer, updateServer, deleteServer, setServerSession } from '../data-access';
import * as randomstring from 'randomstring';
import * as cryptoJs from 'crypto-js';
import { Configuration } from '../../../backend/src/config';
import { SchemaValidator } from '../../../backend/src/security/schemaValidator';
import { serverSchema } from '../security/schemaValidator';
import { ChannelsBlSingleton } from '../logic';

@Tags('Servers')
@Route('servers')
export class LocalServersController extends Controller {

    /**
     * Get local servers in the system.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getServers(): Promise<LocalServer[]> {
        return await getServers();
    }

    /**
     * Get local server by its id.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('{serverId}')
    public async getServer(serverId: string): Promise<LocalServer> {
        return await getServer(serverId);
    }

    /**
     * Add a new local server to the system.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createServer(@Body() server: LocalServer): Promise<void> {
        try {
            server = await SchemaValidator(server, serverSchema);
        } catch (err) {
            this.setStatus(422);
            return;
        }
        return await createServer(server);
    }

    /**
     * Update local server properties.
     * @param localServerId local server to update.
     * @param localServer new properties object to set.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{serverId}')
    public async updateLocalServer(serverId: string, @Body() server: LocalServer): Promise<void> {
        try {
            server = await SchemaValidator(server, serverSchema);
        } catch (err) {
            this.setStatus(422);
            return;
        }
        server.macAddress = serverId;
        return await updateServer(server);
    }

    /**
     * Remove local server from the system.
     * @param localServerId local server to remove.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{serverId}')
    public async deleteLocalServer(serverId: string): Promise<void> {
        await deleteServer(serverId);
        await ChannelsBlSingleton.disconnectLocalServer(serverId);
    }

    /**
     * Generate a new authentication key for the local server.
     * (delete current key if exist).
     *
     * KEEP GENERATED KEY PRIVATE AND SECURE,
     * PUT IT IN YOUR LOCAL SERVER AND NEVER SHOW IT TO ANYBODY!!!
     * @param serverId The local server to generate for.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('auth/{serverId}')
    public async generateAuthKeyLocalServer(serverId: string): Promise<string> {

        const server = await getServer(serverId);

        /** Generate key */
        const sessionKey = randomstring.generate(64);

        /**
         * Hash it to save only hash and *not* key plain text
         */
        const hashedKey = cryptoJs.SHA512(sessionKey + Configuration.keysHandling.saltHash).toString();

        /** Create session object */
        const serverSession: ServerSession = {
            server,
            hashedKey,
        };

        await setServerSession(serverSession);

        await ChannelsBlSingleton.disconnectLocalServer(serverId);

        return await sessionKey;
    }

}
