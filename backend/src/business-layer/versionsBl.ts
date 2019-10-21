import { exec } from 'child-process-promise';
import * as simplegit from 'simple-git/promise';
import { Configuration } from '../config';
import { ErrorResponse, UpdateResults, ProgressStatus, VersionInfo, VersionUpdateStatus } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

export class VersionsBl {

    private git = simplegit();
    private updateStatus: ProgressStatus = 'finished';

    constructor() {

    }

    /**
     * Install/update NPM dependencies in the background. it's can take a while.
     */
    private async updateVersionDependencies() {
        try {
            logger.info(`starting NPM install, it's can take a while`);
            const installationResults = await exec('npm ci');
            logger.info(`installing last dependencies results: ${installationResults.stdout}`);
            this.updateStatus = 'finished';
        } catch (error) {
            this.updateStatus = 'fail';
            logger.warn(`Installing last dependencies fail ${error.stdout}`);
        }
    }

    /**
     * Update CASA-net application to the latest version.
     * Step 1: pull changes from remote repo.
     * Step 2: install the new dependencies update via npm.
     */
    public async updateToLastVersion(): Promise<UpdateResults> {
        /** Get last update from git repo */
        try {

            /** Skip process if updating application already in progress */
            if (this.updateStatus === 'inProgress') {
                return {
                    alreadyUpToDate: false,
                };
            }
            this.updateStatus = 'inProgress';

            /** Clean up the workspace, this is a dangerous part!!! it will remove any files change. */
            if (Configuration.runningMode === 'prod') {
                /** clean all workstation to the HEAD image. to allow the git pull. */
                await this.git.reset('hard');
            }

            /** Pull last version from the GitHub repo. */
            const pullResults = await this.git.pull('origin', 'master', { '--rebase': 'false' });

            logger.info(`pull last version pulld ${pullResults.summary.changes} changes`);

            /** If thers is no any change just return. */
            if (pullResults.summary.changes === 0) {
                this.updateStatus = 'finished';
                return {
                    alreadyUpToDate: true,
                };
            }

            /** Fetch new tags if exist in remote. */
            await this.git.fetch(['--tags', '--force']);

        } catch (error) {
            this.updateStatus = 'fail';
            logger.warn(`Pulling last change from remote repo fail ${error.message}`);
            throw {
                responseCode: 7501,
                message: 'Pulling last change from remote repo fail',
            } as ErrorResponse;
        }

        /** Install the last dependencies updates in the background */
        this.updateVersionDependencies();

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
     * Get current *localy* version.
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
            logger.warn(`Getting latast version (tag) fail ${error.message}`);
            throw {
                responseCode: 9501,
                message: 'Get current version fail',
            } as ErrorResponse;
        }
    }
}

export const VersionsBlSingleton = new VersionsBl();
