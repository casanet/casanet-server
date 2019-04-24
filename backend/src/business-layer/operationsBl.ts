import * as moment from 'moment';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import * as randomstring from 'randomstring';
import { OperationsDal, OperationsDalSingleton } from '../data-layer/operationsDal';
import { ErrorResponse, MinionStatus, Operation, OperationActivity, OperationResult } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';
import { Delay } from '../utilities/sleep';
import { MinionsBl, MinionsBlSingleton } from './minionsBl';

export class OperationsBl {

    // Dependecies
    private operationsDal: OperationsDal;
    private minionsBl: MinionsBl;

    /**
     * Init OperationsBl . using dependecy injection pattern to allow units testings.
     * @param operationsDal Inject operations dal.
     * @param localNetworkReader Inject the reader function.
     */
    constructor(operationsDal: OperationsDal, minionsBl: MinionsBl) {
        this.operationsDal = operationsDal;
        this.minionsBl = minionsBl;
    }

    /**
     * Validate activities. (minion and status to set).
     * @param operationActiviries activities array to validate.
     */
    private async validateNewOperationActivities(operationActiviries: OperationActivity[]): Promise<ErrorResponse> {
        for (const activity of operationActiviries) {
            const activityMinion = await this.minionsBl.getMinionById(activity.minionId);

            if (!activity.minionStatus[activityMinion.minionType]) {
                throw {
                    responseCode: 2405,
                    message: 'incorrect minion status for activity minion type',
                } as ErrorResponse;
            }
        }

        return;
    }

    /**
     * Invoke each activity.
     * @param operationActiviries activities to invoke.
     */
    private async invokeOperationActivities(operationActiviries: OperationActivity[]): Promise<OperationResult[]> {
        const errors: OperationResult[] = [];
        for (const activity of operationActiviries) {
            await this.minionsBl.setMinionStatus(activity.minionId, activity.minionStatus)
                .catch((error: ErrorResponse) => {
                    errors.push({
                        minionId: activity.minionId,
                        error,
                    });
                });

            /**
             * wait 1 sec between one minion to other, becuase of broadcasting mismatch in some brands communication protocol.
             */
            await Delay(moment.duration(1, 'seconds'));
        }
        return errors;
    }

    /**
     * API
     */

    /**
     * Get all operations array.
     */
    public async getOperations(): Promise<Operation[]> {
        return await this.operationsDal.getOperations();
    }

    /**
     * Get operation by id.
     * @param operationId operation id.
     */
    public async getOperationById(operationId: string): Promise<Operation> {
        return await this.operationsDal.getOperationById(operationId);
    }

    /**
     * Set operation properties.
     * @param operationId operation id.
     * @param operation operation props to set.
     */
    public async SetOperation(operationId: string, operation: Operation): Promise<void> {
        await this.validateNewOperationActivities(operation.activities);
        operation.operationId = operationId;
        return await this.operationsDal.updateOperation(operation);
    }

    /**
     * Create operation.
     * @param operation operation to create.
     */
    public async CreateOperation(operation: Operation): Promise<void> {
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
    public async DeleteOperation(operationId: string): Promise<void> {
        return await this.operationsDal.deleteOperation(operationId);
    }

    /**
     * Trigger operation activities
     * @param operationId operation to trigger.
     * @returns Set status erros if will be any.
     */
    public async triggerOperation(operationId: string): Promise<OperationResult[]> {
        const operation = await this.operationsDal.getOperationById(operationId);
        logger.info(`Invokeing operation ${operation.operationName}, id: ${operationId} ...`);
        const errors = await this.invokeOperationActivities(operation.activities);
        logger.info(`Invokeing operation ${operation.operationName}, id: ${operationId} done`);
        return errors;
    }
}

export const OperationsBlSingleton = new OperationsBl(OperationsDalSingleton, MinionsBlSingleton);
