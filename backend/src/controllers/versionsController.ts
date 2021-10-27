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
import { VersionsBlSingleton } from '../business-layer/versionsBl';
import { ErrorResponse, UpdateResults, VersionInfo, VersionUpdateStatus } from '../models/sharedInterfaces';

@Tags('Version')
@Route('version')
export class VersionsController extends Controller {
  /**
   * Update Casanet application to the latest version (Restart required for the version update complete).
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Put('latest')
  public async updateVersion(): Promise<UpdateResults> {
    return await VersionsBlSingleton.updateToLastVersion();
  }

  /**
   * Get current version update progress status
   */
  @Security('adminAuth')
  @Security('userAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get('update-status')
  public async getUpdateStatus(): Promise<VersionUpdateStatus> {
    return await VersionsBlSingleton.getUpdateStatus();
  }

  /**
   * Get current version.
   * @returns Current version.
   */
  @Security('adminAuth')
  @Security('userAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get()
  public async getCurrentVersion(): Promise<VersionInfo> {
    return await VersionsBlSingleton.getCurrentVersion();
  }

  /**
   * Detect if the current version is last, and if not return the latest version.
   * @returns Empty if latest, if not the version name.
   */
  @Security('adminAuth')
  @Security('userAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get('is-up-date')
  public async isLatestVersion(): Promise<string> {
    return await VersionsBlSingleton.isVersionNotUpToDate();
  }
}
