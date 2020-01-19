"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_promise_1 = require("child-process-promise");
const simplegit = require("simple-git/promise");
const config_1 = require("../config");
const logger_1 = require("../utilities/logger");
class VersionsBl {
    constructor() {
        this.git = simplegit();
        this.updateStatus = 'finished';
    }
    /**
     * Update CASA-net application to the latest version.
     * Step 1: pull changes from remote repo.
     * Step 2: install the new dependencies update via npm.
     */
    async updateToLastVersion() {
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
            if (config_1.Configuration.runningMode === 'prod') {
                /** clean all workstation to the HEAD image. to allow the git pull. */
                await this.git.reset('hard');
            }
            /** Pull last version from the GitHub repo. */
            const pullResults = await this.git.pull('origin', 'master', { '--rebase': 'false' });
            logger_1.logger.info(`pull last version pulld ${pullResults.summary.changes} changes`);
            /** If thers is no any change just return. */
            if (pullResults.summary.changes === 0) {
                this.updateStatus = 'finished';
                return {
                    alreadyUpToDate: true,
                };
            }
            /** Fetch new tags if exist in remote. */
            await this.git.fetch(['--tags', '--force']);
        }
        catch (error) {
            this.updateStatus = 'fail';
            logger_1.logger.warn(`Pulling last change from remote repo fail ${error.message}`);
            throw {
                responseCode: 7501,
                message: 'Pulling last change from remote repo fail',
            };
        }
        /** Install the last dependencies updates in the background */
        this.updateVersionDependencies();
        return {
            alreadyUpToDate: false,
        };
    }
    /** Get version update status */
    async getUpdateStatus() {
        return {
            updateStatus: this.updateStatus,
        };
    }
    /**
     * Get current *localy* version.
     * @returns Current version.
     */
    async getCurrentVersion() {
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
        }
        catch (error) {
            logger_1.logger.warn(`Getting latast version (tag) fail ${error.message}`);
            throw {
                responseCode: 9501,
                message: 'Get current version fail',
            };
        }
    }
    /**
     * Install/update NPM dependencies in the background. it's can take a while.
     */
    async updateVersionDependencies() {
        try {
            logger_1.logger.info(`starting NPM install, it's can take a while`);
            const installationResults = await child_process_promise_1.exec('npm ci');
            logger_1.logger.info(`installing last dependencies results: ${installationResults.stdout}`);
            this.updateStatus = 'finished';
        }
        catch (error) {
            this.updateStatus = 'fail';
            logger_1.logger.warn(`Installing last dependencies fail ${error.stdout}`);
        }
    }
}
exports.VersionsBl = VersionsBl;
exports.VersionsBlSingleton = new VersionsBl();
//# sourceMappingURL=versionsBl.js.map