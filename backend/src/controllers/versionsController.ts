import * as express from 'express';
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Request, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { VersionsBlSingleton } from '../business-layer/versionsBl';
import { ErrorResponse, User, UpdateResults, VersionInfo } from '../models/sharedInterfaces';

@Tags('Version')
@Route('version')
export class VersionsController extends Controller {

    /**
     * Update CASA-net application to the latest version (Restart required for the version update complete).
     */
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('latest')
    public async updateVersion(): Promise<UpdateResults> {
        return await VersionsBlSingleton.updateToLastVersion();
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
}
