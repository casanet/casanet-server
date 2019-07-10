import { exec } from 'child-process-promise';
import * as simplegit from 'simple-git/promise';
import { Configuration } from '../config';
import { ErrorResponse, UpdateResults, VersionInfo } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

export class VersionsBl {

    private git = simplegit();

    constructor() {

    }

    /**
     * Update CASA-net application to the latest version.
     * Step 1: pull changes from remote repo.
     * Step 2: install the new dependencies update via npm.
     */
    public async updateToLastVersion(): Promise<UpdateResults> {
        /** Get last update from git repo */
        try {
            /** Clean up the workspace, this is a dangerous part!!! it will remove any files change. */
            if (Configuration.runningMode === 'prod') {
                /** clean all workstation to the HEAD image. to allow the git pull. */
                await this.git.reset('hard');
            }

            const pullResults = await this.git.pull('origin', 'master', { '--rebase': 'false' });

            logger.info(`pull last version pulld ${pullResults.summary.changes} changes`);

            /** If thers is no any change just return. */
            if (pullResults.summary.changes === 0) {
                return {
                    alreadyUpToDate: true,
                };
            }

            /** Fetch new tags if exist in remote. */
            await this.git.fetch(['--tags', '--force']);

        } catch (error) {
            logger.warn(`Pulling last change from remote repo fail ${error.message}`);
            throw {
                responseCode: 7501,
                message: 'Pulling last change from remote repo fail',
            } as ErrorResponse;
        }

        /** Install last dependencies updates */
        try {
            const installationResults = await exec('npm i');

            logger.info(`installing last dependencies results  ${installationResults.stdout}`);

        } catch (error) {
            logger.warn(`Installing last dependencies fail ${error.stdout}`);
            throw {
                responseCode: 8501,
                message: 'Installing last dependencies fail',
            } as ErrorResponse;
        }

        return {
            alreadyUpToDate: false,
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
