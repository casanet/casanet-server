import { Body, Controller, Delete, Get, Header, Path, Post, Put, Query, Response, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { OperationsBlSingleton } from '../business-layer/operationsBl';
import { ErrorResponse, Operation, OperationResult } from '../models/sharedInterfaces';

@Tags('Operations')
@Route('operations')
export class OperationsController extends Controller {

    /**
     * Get all operations in system.
     * @returns Operations array.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getOperations(): Promise<Operation[]> {
        return await OperationsBlSingleton.getOperations();
    }

    /**
     * Get operation by id.
     * @returns Operation.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Get('{operationId}')
    public async getOperation(operationId: string): Promise<Operation> {
        return await OperationsBlSingleton.getOperationById(operationId);
    }

    /**
     * Update operation values.
     * @param operationId OperationId id.
     * @param operation Operation object to update to.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{operationId}')
    public async setOperation(operationId: string, @Body() operation: Operation): Promise<void> {
        return await OperationsBlSingleton.SetOperation(operationId, operation);
    }

    /**
     * Delete operation from system.
     * @param operationId Operation id.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{operationId}')
    public async deleteOperation(operationId: string): Promise<void> {
        return await OperationsBlSingleton.DeleteOperation(operationId);
    }

    /**
     *  Creates new operation.
     * @param operation new operation to create.
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createOperation(@Body() operation: Operation): Promise<void> {
        return await OperationsBlSingleton.CreateOperation(operation);
    }

    /**
     *  Trigger operation by id.
     * @returns Set minions status errors (if any).
     */
    @Security('userAuth')
    @Security('adminAuth')
    @Response<ErrorResponse>(501, 'Server error')
    @Post('trigger/{operationId}')
    public async triggerOperation(operationId: string): Promise<OperationResult[]> {
        return await OperationsBlSingleton.triggerOperation(operationId);
    }
}
