"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_promise_1 = require("child-process-promise");
const simplegit = require("simple-git/promise");
const logger_1 = require("../utilities/logger");
class VersionsBl {
    constructor() {
        this.git = simplegit();
    }
    /**
     * Update CASA-net application to the latest version.
     * Step 1: pull changes from remote repo.
     * Step 2: install the new dependencies update via npm.
     */
    async updateToLastVersion() {
        /** Get last update from git repo */
        try {
            const pullResults = await this.git.pull('origin', 'master', { '--rebase': 'false' });
            logger_1.logger.info(`pull last version pulld ${pullResults.summary.changes} changes`);
            /** If thers is no any change just return. */
            if (pullResults.summary.changes === 0) {
                return;
            }
        }
        catch (error) {
            logger_1.logger.warn(`Pulling last change from remote repo fail ${error.message}`);
            throw {
                responseCode: 7501,
                message: 'Pulling last change from remote repo fail',
            };
        }
        /** Install last dependencies updates */
        try {
            const installationResults = await child_process_promise_1.exec('npm i');
            logger_1.logger.info(`installing last dependencies results  ${installationResults.stdout}`);
        }
        catch (error) {
            logger_1.logger.warn(`Installing last dependencies fail ${error.stdout}`);
            throw {
                responseCode: 8501,
                message: 'Installing last dependencies fail',
            };
        }
    }
    /**
     * Get current *localy* version.
     * @returns Current version (Git latest tag + commit hash).
     */
    async getCurrentVersion() {
        try {
            const tags = await this.git.tags();
            const commintHash = await this.git.revparse(['--short', 'HEAD']);
            return `${tags.latest} (${commintHash})`;
        }
        catch (error) {
            logger_1.logger.warn(`Getting latast version (tag) fail ${error.message}`);
            return 'unknown';
        }
    }
}
exports.VersionsBl = VersionsBl;
exports.VersionsBlSingleton = new VersionsBl();
//# sourceMappingURL=versionsBl.js.map