"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const randomstring = require("randomstring");
const operationsDal_1 = require("../data-layer/operationsDal");
const logger_1 = require("../utilities/logger");
const sleep_1 = require("../utilities/sleep");
const minionsBl_1 = require("./minionsBl");
class OperationsBl {
    /**
     * Init OperationsBl . using dependecy injection pattern to allow units testings.
     * @param operationsDal Inject operations dal.
     * @param localNetworkReader Inject the reader function.
     */
    constructor(operationsDal, minionsBl) {
        this.operationsDal = operationsDal;
        this.minionsBl = minionsBl;
    }
    /**
     * API
     */
    /**
     * Get all operations array.
     */
    async getOperations() {
        return await this.operationsDal.getOperations();
    }
    /**
     * Get operation by id.
     * @param operationId operation id.
     */
    async getOperationById(operationId) {
        return await this.operationsDal.getOperationById(operationId);
    }
    /**
     * Set operation properties.
     * @param operationId operation id.
     * @param operation operation props to set.
     */
    async SetOperation(operationId, operation) {
        await this.validateNewOperationActivities(operation.activities);
        operation.operationId = operationId;
        return await this.operationsDal.updateOperation(operation);
    }
    /**
     * Create operation.
     * @param operation operation to create.
     */
    async CreateOperation(operation) {
        await this.validateNewOperationActivities(operation.activities);
        /**
         * Generate new id. (never trust client....)
         */
        operation.operationId = randomstring.generate(6);
        return await this.operationsDal.createOperation(operation);
    }
    /**
     * Delete operation.
     * @param operationId operation id to delete.
     */
    async DeleteOperation(operationId) {
        return await this.operationsDal.deleteOperation(operationId);
    }
    /**
     * Trigger operation activities
     * @param operationId operation to trigger.
     * @returns Set status erros if will be any.
     */
    async triggerOperation(operationId) {
        const operation = await this.operationsDal.getOperationById(operationId);
        logger_1.logger.info(`Invokeing operation ${operation.operationName}, id: ${operationId} ...`);
        const errors = await this.invokeOperationActivities(operation.activities);
        logger_1.logger.info(`Invokeing operation ${operation.operationName}, id: ${operationId} done`);
        return errors;
    }
    /**
     * Validate activities. (minion and status to set).
     * @param operationActiviries activities array to validate.
     */
    async validateNewOperationActivities(operationActiviries) {
        for (const activity of operationActiviries) {
            const activityMinion = await this.minionsBl.getMinionById(activity.minionId);
            if (!activity.minionStatus[activityMinion.minionType]) {
                throw {
                    responseCode: 2405,
                    message: 'incorrect minion status for activity minion type',
                };
            }
        }
        return;
    }
    /**
     * Invoke each activity.
     * @param operationActiviries activities to invoke.
     */
    async invokeOperationActivities(operationActiviries) {
        const errors = [];
        for (const activity of operationActiviries) {
            /**
             * wait 1 sec between one minion to other, becuase of broadcasting mismatch in some brands communication protocol.
             */
            await sleep_1.Delay(moment.duration(1, 'seconds'));
            logger_1.logger.info(`Setting minion ${activity.minionId} a new status by operation activity...`);
            try {
                await this.minionsBl.setMinionStatus(activity.minionId, activity.minionStatus);
                continue;
            }
            catch (error) {
                logger_1.logger.warn(`Setting minion ${activity.minionId} a new status by operation activity data: ` +
                    `${JSON.stringify(activity.minionStatus)} fail, ` +
                    `${JSON.stringify(error)}`);
            }
            await sleep_1.Delay(moment.duration(3, 'seconds'));
            logger_1.logger.info(`Trying set status for  ${activity.minionId} agine...`);
            try {
                await this.minionsBl.setMinionStatus(activity.minionId, activity.minionStatus);
                continue;
            }
            catch (error) {
                logger_1.logger.warn(`The second try to set status for ${activity.minionId} fail too`);
            }
            await sleep_1.Delay(moment.duration(5, 'seconds'));
            logger_1.logger.info(`Last chance of set status for  ${activity.minionId} ...`);
            try {
                await this.minionsBl.setMinionStatus(activity.minionId, activity.minionStatus);
            }
            catch (error) {
                logger_1.logger.warn(`Last chance to set status for ${activity.minionId} fail too. sorry ;)`);
                errors.push({
                    minionId: activity.minionId,
                    error,
                });
            }
        }
        return errors;
    }
}
exports.OperationsBl = OperationsBl;
exports.OperationsBlSingleton = new OperationsBl(operationsDal_1.OperationsDalSingleton, minionsBl_1.MinionsBlSingleton);
//# sourceMappingURL=operationsBl.js.map