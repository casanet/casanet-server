import * as express from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Path,
  Post,
  Put,
  Request,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { RemoteConnectionBlSingleton } from '../business-layer/remoteConnectionBl';
import {
  ErrorResponse,
  Login,
  MinionFeed,
  RemoteConnectionStatus,
  RemoteSettings,
  Timing,
  TimingFeed,
} from '../models/sharedInterfaces';
import { RemoteSettingsSchema, SchemaValidator } from '../security/schemaValidator';
import { getMachineMacAddress } from '../utilities/macAddress';

@Tags('Remote')
@Route('remote')
export class RemoteConnectionController extends Controller {
  /**
   * Get remote server host/IP.
   * or empty if not set.
   */
  @Security('adminAuth')
  @Security('userAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get()
  public async getRemoteHost(): Promise<string> {
    this.setHeader('content-type', 'text/html; charset=UTF-8');
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
   * Used when creating a new local server in a remote server.
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get('machine-mac')
  public async getMachineMac(): Promise<string> {
    return await getMachineMacAddress();
  }

  /**
   * Connect to remote server with given remote settings.
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
        responseCode: 2422,
        message: 'remote settings data incorrent',
      } as ErrorResponse;
    }
  }

  /**
   * Remove and disconnect remote server connection.
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Delete()
  public async removeRemoteSettings(): Promise<void> {
    return await RemoteConnectionBlSingleton.removeRemoteSettings();
  }
}
