import * as cryptoJs from 'crypto-js';
import { Request, Response } from 'express';
import * as randomstring from 'randomstring';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
import { logger } from '../../../backend/src/utilities/logger';
import { LocalServersDal, LocalServersDalSingleton } from '../data-layer/localServersDal';
import { LocalServer, LocalServerInfo } from '../models/sharedInterfaces';

export class LocalServersBl {

    constructor(private localServersDal: LocalServersDal) {
    }

    /**
     * Get all local servers.
     */
    public async getlocalServers(): Promise<LocalServer[]> {
        return await this.localServersDal.getLocalServers();
    }

    /**
     * Get local server by local server mac address.
     * @param macAddress local server machine/mac address.
     */
    public async getlocalServersByMac(macAddress: string): Promise<LocalServer> {
        const localServers = await this.getlocalServers();
        for (const localServer of localServers) {
            if (localServer.macAddress === macAddress) {
                return localServer;
            }
        }

        throw {
            responseCode: 5001,
            message: 'local server not exsit',
        } as ErrorResponse;
    }

    /**
     * Get local servers info collection of each local server that user mention as valid users
     * @param userEmail user to get local server info.
     * @returns local servers info collection.
     */
    public async getLocalServerInfoByUser(userEmail: string): Promise<LocalServerInfo[]> {

        const userLocalServer: LocalServerInfo[] = [];
        for (const localServer of await this.getlocalServers()) {
            for (const user of localServer.validUsers) {
                if (user === userEmail) {
                    userLocalServer.push({
                        localServerId: localServer.localServerId,
                        displayName: localServer.displayName,
                    });
                    break;
                }
            }
        }
        return userLocalServer;
    }

    /**
     * Get local server by id.
     * @param localServerId local server id.
     * @returns local server object.
     */
    public async getlocalServersById(localServerId: string): Promise<LocalServer> {
        return await this.localServersDal.getLocalServer(localServerId);
    }

    /**
     * Create new local server in system.
     * @param localServer local server to create.
     */
    public async createLocalServer(localServer: LocalServer): Promise<void> {
        /** local server mac address shuold be uniqe. */
        let isLocalSereverMacInUse = false;
        try {
            await this.getlocalServersByMac(localServer.macAddress);
            isLocalSereverMacInUse = true;
        } catch (error) { }
        if (isLocalSereverMacInUse) {
            throw {
                responseCode: 5001,
                message: 'local server with given mac address already exsit',
            } as ErrorResponse;
        }
        /** Generate id to local server */
        localServer.localServerId = randomstring.generate(5);

        localServer.connectionStatus = false;

        /** save it */
        await this.localServersDal.createLocalServer(localServer);
    }

    /**
     * update local server proprties.
     * @param localServer local server with updated properties.
     */
    public async updateLocalServer(localServer: LocalServer): Promise<void> {

        const currentLocalServer = await this.getlocalServersById(localServer.localServerId);

        /** Dont allow update mac address.  */
        if (localServer.macAddress !== currentLocalServer.macAddress) {
            throw {
                responseCode: 4005,
                message: 'changing local server mac address is unable.',
            } as ErrorResponse;
        }

        /** There is no point to update status from client. */
        localServer.connectionStatus = currentLocalServer.connectionStatus;

        /** save update */
        await this.localServersDal.updateLocalServer(localServer);
    }

    /**
     * Change local server status property.
     * @param localServerId local server to set status.
     * @param status The new status.
     */
    public async setLocalServerConnectionStatus(localServerId: string, status: boolean) {
        try {
            const localServer = await this.getlocalServersById(localServerId);
            localServer.connectionStatus = status;
        } catch (error) {
            logger.debug(`faile to set ${localServerId} status ${status}, local server not exists`);
        }
    }

    /**
     * Remove local server from system
     * @param localServerId local server to remove.
     */
    public async deleteLocalServer(localServerId: string): Promise<void> {
        return await this.localServersDal.deleteLocalServer(localServerId);
    }

    /**
     * Add email account to local server valid to forward collection.
     * @param localServerId The local server to add the account to.
     * @param email The email account to add.
     */
    public async addAccountForwardValid(localServerId: string, email: string) {
        const localServer = await this.localServersDal.getLocalServer(localServerId);

        if (localServer.validUsers.indexOf(email) === -1) {
            localServer.validUsers.push(email);
            this.localServersDal.updateLocalServer(localServer);
        }
    }

    /**
     * Remove email account to local server valid to forward collection.
     * @param localServerId The local server to remove the account from.
     * @param email The email account to remove.
     */
    public async removeAccountForwardValid(localServerId: string, email: string) {
        const localServer = await this.localServersDal.getLocalServer(localServerId);

        if (localServer.validUsers.indexOf(email) !== -1) {
            localServer.validUsers.splice(localServer.validUsers.indexOf(email), 1);
            this.localServersDal.updateLocalServer(localServer);
        }
    }
}

export const LocalServersBlSingleton = new LocalServersBl(LocalServersDalSingleton);
