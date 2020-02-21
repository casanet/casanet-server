import { exec } from 'child-process-promise';
import * as simplegit from 'simple-git/promise';
import { Configuration } from '../config';
import {
  ErrorResponse,
  ProgressStatus,
  UpdateResults,
  VersionInfo,
  VersionUpdateStatus,
} from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

export class VersionsBl {
  private git = simplegit();
  private updateStatus: ProgressStatus = 'finished';

  constructor() {}

  /**
   * Update CASA-net application to the latest version.
   * Step 1: Pull changes from remote repo.
   * Step 2: Install the new dependencies update via npm (backend + frontend).
   * Step 3: Rebuild project (backend + frontend).
   * Step 4: if there is a command to apply the changes (such as 'reboot'), run it.
   */
  public async updateToLastVersion(): Promise<UpdateResults> {
    /** Skip process if updating application already in progress */
    if (this.updateStatus === 'inProgress') {
      return {
        alreadyUpToDate: false,
      };
    }
    this.updateStatus = 'inProgress';

    /** Get last update from git repo */
    try {
      const hasVersionUpdate = await this.fetchLastGitCommit();

      /** If there was no any commit to update to */
      if (!hasVersionUpdate) {
        this.updateStatus = 'finished';
        return {
          alreadyUpToDate: true,
        };
      }
    } catch (error) {
      this.updateStatus = 'fail';
      logger.warn(`Pulling last change from remote repo fail ${error.message}`);
      throw {
        responseCode: 7501,
        message: 'Pulling last change from remote repo fail',
      } as ErrorResponse;
    }

    /** Run async function *without* awaiting for it, to process the update build in the background */
    this.updateVersionInBackground();

    return {
      alreadyUpToDate: false,
    };
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
      const tags = await this.git.tags();
      const commintHash = await this.git.revparse(['--short', 'HEAD']);
      const rawTimestamp = await this.git.show(['-s', '--format=%ct']);

      const timestamp = +rawTimestamp * 1000;
      return {
        version: tags.latest,
        commintHash,
        timestamp,
      };
    } catch (error) {
      logger.warn(`Getting latest version (tag) fail ${error.message}`);
      throw {
        responseCode: 9501,
        message: 'Get current version fail',
      } as ErrorResponse;
    }
  }

  /**
   * Fetch last git commit from the remote repo.
   * @returns True if there was version update.
   */
  private async fetchLastGitCommit(): Promise<boolean> {
    /** Clean up the workspace, this is a dangerous part!!! it will remove any files change. */
    if (Configuration.runningMode === 'prod') {
      /** clean all workstation to the HEAD image. to allow the git pull. */
      await this.git.reset('hard');
    }

    /** Get the correct branch */
    const branch = Configuration.runningMode === 'prod' ? 'master' : 'development';

    /** switch the correct branch */
    await this.git.checkout(branch);

    /** Pull last version from the GitHub repo. */
    const pullResults = await this.git.pull('origin', branch, { '--rebase': 'false' });

    logger.info(`pull last version pulled ${pullResults.summary.changes} changes`);

    /** If there is no any change just return. */
    if (pullResults.summary.changes === 0) {
      /** Mark that there is no commit to update to */
      return false;
    }

    /** Fetch new tags if exist in remote. */
    await this.git.fetch(['--tags', '--force']);

    /** Mark that git HEAD updated */
    return true;
  }

  /**
   * Run the version update process work async.
   */
  private async updateVersionInBackground() {
    /** Install the last dependencies updates in the background */
    try {
      await this.updateVersionDependencies();
    } catch (error) {
      this.updateStatus = 'fail';
      logger.warn(`Installing last dependencies fail ${error.stdout || error.message}`);
      return;
    }

    /** Build the last version in the background */
    try {
      await this.buildNewVersion();
    } catch (error) {
      this.updateStatus = 'fail';
      logger.warn(`Installing last dependencies fail ${error.stdout || error.message}`);
      return;
    }

    /** Apply version changes */
    await this.applyVersionChanges();

    logger.info(`Updating to last version '${(await this.getCurrentVersion()).commintHash}' successfully done`);
    this.updateStatus = 'finished';
  }

  /**
   * Install/update NPM dependencies in the background. it's can take a while.
   */
  private async updateVersionDependencies() {
    logger.info(`starting NPM install, it's can take a while`);

    const backendDepInstallResults = await exec('npm ci');
    logger.info(`installing last backend dependencies results: ${backendDepInstallResults.stdout}`);

    const frontendDepInstallResults = await exec('npm ci', { cwd: '../frontend' });
    logger.info(`installing last frontend dependencies results: ${frontendDepInstallResults.stdout}`);
  }

  /**
   * Build the project in the background. it's can take a while.
   */
  private async buildNewVersion() {
    logger.info(`Starting project build, it's can take a while`);

    const backendBuildResults = await exec('npm run build');
    logger.info(`Building last backend project results: ${backendBuildResults.stdout}`);

    const frontendBuildResults = await exec('npm run build', { cwd: '../frontend' });
    logger.info(`Building last frontend project results: ${frontendBuildResults.stdout}`);
  }

  /**
   * Apply the version update changes, usually its by restarting machine/process
   */
  private async applyVersionChanges() {
    /** THIS IS A DANGERS ACTION! BE SURE THAT USER KNOW WHAT IT IS SET AS RESET COMMAND */
    const { RESET_MACHINE_ON_VERSION_UPDATE } = process.env;
    if (!RESET_MACHINE_ON_VERSION_UPDATE) {
      logger.info(`There is no RESET_MACHINE_ON_VERSION_UPDATE env var, skipping after version update command`);
      return;
    }

    try {
      logger.info(`executing RESET_MACHINE_ON_VERSION_UPDATE='${RESET_MACHINE_ON_VERSION_UPDATE}' command...`);
      /**
       * Execute a command to apply the version changes
       * For example in raspberry pi machine the command can be 'sudo reboot'.
       */
      await exec(RESET_MACHINE_ON_VERSION_UPDATE);
    } catch (error) {
      logger.warn(
        `executing RESET_MACHINE_ON_VERSION_UPDATE=${RESET_MACHINE_ON_VERSION_UPDATE}' command failed ${error.stdout ||
          error.message}`,
      );
    }
  }
}

export const VersionsBlSingleton = new VersionsBl();
