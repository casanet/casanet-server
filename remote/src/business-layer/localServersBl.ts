import * as cryptoJs from 'crypto-js';
import { Request, Response } from 'express';
import * as randomstring from 'randomstring';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
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
        let isLocalSereverMacIsUse = false;
        try {
            await this.getlocalServersByMac(localServer.macAddress);
            isLocalSereverMacIsUse = true;
        } catch (error) { }
        if (isLocalSereverMacIsUse) {
            throw {
                responseCode: 5001,
                message: 'local server with given mac address aready exsit',
            } as ErrorResponse;
        }
        /** Generate id to local server */
        localServer.localServerId = randomstring.generate(5);

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

        /** Thre is no point to update status from client. */
        localServer.connectionStatus = currentLocalServer.connectionStatus;

        /** save update */
        await this.localServersDal.updateLocalServer(localServer);
    }

    /**
     * Remove local server from system
     * @param localServerId local server to remove.
     */
    public async deleteLocalServer(localServerId: string): Promise<void> {
        return await this.localServersDal.deleteLocalServer(localServerId);
    }
}

export const LocalServersBlSingleton = new LocalServersBl(LocalServersDalSingleton);
