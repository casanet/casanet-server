import { exec } from 'child-process-promise';
import * as simplegit from 'simple-git/promise';
import { ErrorResponse } from '../models/sharedInterfaces';
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
    public async updateToLastVersion() {
        /** Get last update from git repo */
        try {
            const pullResults = await this.git.pull('origin', 'master', { '--rebase': 'false' });

            logger.info(`pull last version pulld ${pullResults.summary.changes} changes`);

            /** If thers is no any change just return. */
            if (pullResults.summary.changes === 0) {
                return;
            }

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
    }

    /**
     * Get current *localy* version.
     * @returns Current version (Git latest tag + commit hash).
     */
    public async getCurrentVersion(): Promise<string> {
        try {
            const tags = await this.git.tags();

            const commintHash = await this.git.revparse(['--short', 'HEAD']);
            return `${tags.latest} (${commintHash})`;
        } catch (error) {
            logger.warn(`Getting latast version (tag) fail ${error.message}`);
            return 'unknown';
        }
    }
}

export const VersionsBlSingleton = new VersionsBl();
