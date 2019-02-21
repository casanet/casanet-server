import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { RemoteConnectionBlSingleton } from '../business-layer/remoteConnectionBl';
import { ErrorResponse, Login, MinionFeed, RemoteConnectionStatus, RemoteSettings, Timing, TimingFeed } from '../models/sharedInterfaces';
import { RemoteSettingsSchema, SchemaValidator } from '../security/schemaValidator';
import { GetMachinMacAddress } from '../utilities/macAddress';

@Tags('Remote')
@Route('remote')
export class RemoteConnectionController extends Controller {

    /**
     * Get remote server host/ip.
     * or empty if not set.
     */
    @Security('adminAuth')
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getRemoteHost(): Promise<string> {
        return await RemoteConnectionBlSingleton.getRemoteHost();
    }

    /**
     * Get connection status to remote status.
     */
    @Security('adminAuth')
    @Security('userAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('status')
    public async getConnectionStatus(): Promise<RemoteConnectionStatus> {
        return RemoteConnectionBlSingleton.connectionStatus;
    }

    /**
     * Get local casa-server machine mac address.
     * Used when remote server require local server mac address befor pairing.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('machine-mac')
    public async getMachineMac(): Promise<string> {
        return await GetMachinMacAddress();
    }

    /**
     * Connect to remote server by given remote settings.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put()
    public async setRemoteSettings(@Body() remoteSettings: RemoteSettings): Promise<void> {
        try {
            /** Validate remote settings */
            const validRemoteSettings = await SchemaValidator(remoteSettings, RemoteSettingsSchema);
            return await RemoteConnectionBlSingleton.setRemoteSettings(validRemoteSettings);
        } catch (error) {
            throw {
                responseCode: 4022,
                message: 'remote settings data incorrent',
            } as ErrorResponse;
        }
    }

    /**
     * Remove/disconnect remote server connection.
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete()
    public async removeRemoteSettings(): Promise<void> {
        return await RemoteConnectionBlSingleton.removeRemoteSettings();
    }
}
