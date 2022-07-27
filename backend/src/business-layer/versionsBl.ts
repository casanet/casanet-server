import { exec } from 'child-process-promise';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as rp from 'request-promise';
import { Configuration } from '../config';
import {
  ErrorResponse,
  ProgressStatus,
  UpdateResults,
  VersionInfo,
  VersionUpdateStatus,
} from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

const UPGRADE_TO_PRE_RELEASE = process.env.UPGRADE_TO_PRE_RELEASE === 'true';

logger.info(`UPGRADE_TO_PRE_RELEASE to be ${UPGRADE_TO_PRE_RELEASE}`);

export class VersionsBl {
  private updateStatus: ProgressStatus = 'finished';

  constructor() { }

  /**
   * Update Casanet application to the latest version.
   * Step 1: Check if there is a new version.
   * Step 2: Download from GitHub releases the latest version bin file.
   * Step 3: Replace the current bin file.
   * Step 4: If there is a command to apply the changes (such as 'reboot'), run it.
   */
  public async updateToLastVersion(): Promise<UpdateResults> {
    /** Skip process if updating application already in progress */
    if (this.updateStatus === 'inProgress') {
      return {
        alreadyUpToDate: false,
      };
    }
    this.updateStatus = 'inProgress';

    let latestVersion: string;
    try {
      latestVersion = await this.getLatestVersionName();
      const currentVersionInfo = await this.getCurrentVersion();
      if (latestVersion === currentVersionInfo.version) {
        this.updateStatus = 'finished';
        return {
          alreadyUpToDate: true,
        };
      }
    } catch (error) {
      this.updateStatus = 'fail';
      logger.warn(`Pulling last change from remote repo releases fail ${error.message}`);
      throw {
        responseCode: 7501,
        message: 'Pulling last change from remote releases repo fail',
      } as ErrorResponse;
    }

    /** Run async function *without* awaiting for it, to process the update build in the background */
    this.updateVersionInBackground(latestVersion);

    return {
      alreadyUpToDate: false,
    };
  }

  /**
   * Whenever the current version is not the latest
   */
  public async isVersionNotUpToDate(): Promise<string> {
    const latestVersion = await this.getLatestVersionName();
    const currentVersionInfo = await this.getCurrentVersion();
    return latestVersion === currentVersionInfo.version ? '' : latestVersion;
  }


  /** Get version update status */
  public async getUpdateStatus(): Promise<VersionUpdateStatus> {
    return {
      updateStatus: this.updateStatus,
    };
  }

  /**
   * Get current *locally* version.
   * @returns Current version.
   */
  public async getCurrentVersion(): Promise<VersionInfo> {
    try {
      let versionFilePath: string;
      if (Configuration.runningMode === 'prod') {
        versionFilePath = path.join(__dirname, '../', 'versionInfo.json');
      } else {
        versionFilePath = path.join(__dirname, '../../dist', 'versionInfo.json');
      }

      return await fse.readJSON(versionFilePath);
    } catch (error) {
      logger.warn(`Getting latest version (tag) fail ${error.message}`);
      throw {
        responseCode: 9501,
        message: 'Get current version fail',
      } as ErrorResponse;
    }
  }

  private getOperationSystemExecutionName(): string {
    let osExtension: string;
    switch (process.platform) {
      case 'darwin':
        osExtension = 'macos';
        break;
      case 'win32':
        osExtension = 'win';
        break;
      case 'linux':
        osExtension = 'linux';
        break;
    }

    return `casanet_${osExtension}_${process.arch}${process.platform === 'win32' ? '.exe' : ''}`;
  }

  private async downloadNewVersion(newVersion: string) {
    const tempDir = './temp';
    if (fse.existsSync(tempDir)) {
      await fse.remove(tempDir);
      logger.info(`[version] "${tempDir}" directory successfully deleted`);
    }
    await fse.mkdir(tempDir);
    logger.info(`[version] directory "${tempDir}" successfully created`);

    const options = {
      uri: '',
      headers: {
        'User-Agent': 'Request-Promise',
      },
      encoding: null,
    };
    const executionName = this.getOperationSystemExecutionName();
    options.uri = `https://github.com/casanet/casanet-server/releases/download/${newVersion}/${executionName}`;
    logger.info(`[version] downloading "${executionName}" of "${newVersion}" version bin file...`);
    const resExecution = await rp.get(options);
    logger.info(`[version] download "${executionName}" bin file finished successfully`);

    logger.info(`[version] writing "${executionName}" bin file to "${tempDir}" directory`);
    await fse.writeFile(`${tempDir}/${executionName}`, resExecution);

    logger.info(`[version] coping "${executionName}" bin file from "${tempDir}" to the execution directory`);
    await fse.copy(`${tempDir}/${executionName}`, `./${executionName}`);

    // Set execution permission if necessary
    if (process.platform !== 'win32') {
      await fse.chmod(`./${executionName}`, '0777');
    }
  }

  private async getLatestVersionName(): Promise<string> {
    const options = {
      uri: 'https://api.github.com/repos/casanet/casanet-server/releases',
      headers: {
        'User-Agent': 'Request-Promise',
      },
      json: true, // Automatically parses the JSON string in the response
    };
    const res = await rp(options);
    
    const latestRelease = res?.find(release => UPGRADE_TO_PRE_RELEASE || !release?.prerelease);
    
    return latestRelease.tag_name;
  }

  /**
   * Run the version update process work async.
   */
  private async updateVersionInBackground(latestVersion: string) {
    try {
      await this.downloadNewVersion(latestVersion);
    } catch (error) {
      this.updateStatus = 'fail';
      logger.error(`Downloading last version bin failed, ${error.message || error}`);
      return;
    }

    /** Apply version changes */
    await this.applyVersionChanges();

    logger.info(`Updating to last version '${latestVersion}' successfully done`);
  }

  /**
   * Apply the version update changes, usually its by restarting machine/process
   */
  private async applyVersionChanges() {
    /** THIS IS A DANGERS ACTION! BE SURE THAT USER KNOW WHAT IT IS SET AS RESET COMMAND */
    const RESET_MACHINE_ON_VERSION_UPDATE = process.env.RESET_MACHINE_ON_VERSION_UPDATE;
    if (!RESET_MACHINE_ON_VERSION_UPDATE) {
      logger.info(`There is no "RESET_MACHINE_ON_VERSION_UPDATE" env var, skipping after version update command`);
      this.updateStatus = 'finished';
      return;
    }

    try {
      logger.info(`executing RESET_MACHINE_ON_VERSION_UPDATE='${RESET_MACHINE_ON_VERSION_UPDATE}' command...`);
      /**
       * Execute a command to apply the version changes
       * For example in raspberry pi machine the command can be 'sudo reboot'.
       */
      await exec(RESET_MACHINE_ON_VERSION_UPDATE);
      this.updateStatus = 'finished';
    } catch (error) {
      this.updateStatus = 'fail';
      logger.warn(
        `executing RESET_MACHINE_ON_VERSION_UPDATE=${RESET_MACHINE_ON_VERSION_UPDATE}' command failed ${error.stdout ||
        error.message}`,
      );
    }
  }
}

export const VersionsBlSingleton = new VersionsBl();
