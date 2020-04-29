import * as  AdmZip from 'adm-zip';
import * as express from 'express';
import * as fse from 'fs-extra';
import * as path from 'path';
import { Controller, Get, Request, Response, Route, Security } from 'tsoa';
import { MinionsBlSingleton } from '../business-layer/minionsBl';
import { OperationsBlSingleton } from '../business-layer/operationsBl';
import { TimelineBlSingleton } from '../business-layer/timelineBl';
import { TimingsBlSingleton } from '../business-layer/timingsBl';
import { ErrorResponse, UpdateResults, VersionInfo, VersionUpdateStatus } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

@Route('backup')
export class BackupController extends Controller {

  /**
   * Get the current server data as a ZIP file
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get()
  public async getSettingsBackup(@Request() request: express.Request) {
    const zip = new AdmZip();

    const minions = await MinionsBlSingleton.getMinions();
    const minionsData = JSON.stringify(minions, null, 2);
    zip.addFile("minions.json", Buffer.alloc(minionsData.length, minionsData), "minions");

    const operations = await OperationsBlSingleton.getOperations();
    const operationsData = JSON.stringify(operations, null, 2);
    zip.addFile("operations.json", Buffer.alloc(operationsData.length, operationsData), "operations");

    const timings = await TimingsBlSingleton.getTimings();
    const timingsData = JSON.stringify(timings, null, 2);
    zip.addFile("timings.json", Buffer.alloc(timingsData.length, timingsData), "timings");

    const timeline = await TimelineBlSingleton.getTimeline();
    const timelineData = JSON.stringify(timeline, null, 2);
    zip.addFile("timeline.json", Buffer.alloc(timelineData.length, timelineData), "timeline");

    const res = request.res as express.Response;
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=casanet_backup_${new Date().toLocaleDateString()}.zip`);
    
    res.end(zip.toBuffer());
    logger.info(`[backup ctrl] The backup sent successfully to the admin ${request.user}`);
  }
}
