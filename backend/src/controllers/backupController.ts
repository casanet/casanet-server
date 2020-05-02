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

    const dataToZip: Array<{ name: string, data: any }> = [{
      name: 'minions',
      data: await MinionsBlSingleton.getMinions()
    }, {
      name: 'operations',
      data: await OperationsBlSingleton.getOperations()
    }, {
      name: 'timings',
      data: await TimingsBlSingleton.getTimings()
    }, {
      name: 'timeline',
      data: await TimelineBlSingleton.getTimeline()
    }]

    for (const data of dataToZip) {
      const dataAsString = JSON.stringify(data.data, null, 2);
      zip.addFile(`${data.name}.json`, Buffer.from(dataAsString), data.name);
    }

    const res = request.res as express.Response;
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=casanet_backup_${new Date().toLocaleDateString()}.zip`);

    res.end(zip.toBuffer());
    logger.info(`[backup ctrl] The backup sent successfully to the admin ${request.user}`);
  }
}
