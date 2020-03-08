import * as express from 'express';
import * as fse from 'fs-extra';
import * as path from 'path';
import { Controller, Get, Request, Response, Route, Security } from 'tsoa';
import { ErrorResponse, UpdateResults, VersionInfo, VersionUpdateStatus } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

@Route('logs')
export class LogsController extends Controller {
  /**
   * Get the last logs of the local-server (download as text file)
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get()
  public async getLastLogs(@Request() request: express.Request) {
    const res = request.res as express.Response;
    logger.info('[logs controller] Downloading log file...');
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=casalogs_${new Date().toLocaleDateString()}.log`);
    res.end(await fse.promises.readFile('./logs/tech_log.log'));
  }
}
