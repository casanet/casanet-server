import { Body, Controller, Delete, Get, Header, Path, Post, Put, Query, Response, Route, SuccessResponse, Tags } from 'tsoa';
import { ErrorResponse, Operation } from '../models/interfaces';

@Tags('Operations')
@Route('operations')
export class OperationsController extends Controller {

    /**
     * Get all operations in system.
     * @returns Operations array.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Get()
    public async getOperations(): Promise<Operation[]> {
        return [];
        // TODO: await new DevicesService().get(id);
    }

    /**
     * Get operation by id.
     * @returns Operation.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Get('{operationId}')
    public async getOperation(operationId: string): Promise<Operation> {
        return;
        // TODO: await new DevicesService().get(id);
    }

    /**
     * Update operation values.
     * @param operationId OperationId id.
     * @param operation Operation object to update to.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Put('{operationId}')
    public async setOperation(operationId: string, @Body() operation: Operation): Promise<void> {
        // TODO ...
        return;
    }

    /**
     * Delete operation from system.
     * @param operationId Operation id.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Delete('{operationId}')
    public async deleteOperation(operationId: string): Promise<void> {
        // TODO ...
        return;
    }

    /**
     *  Creates new operation.
     * @param operation new operation to create.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Post()
    public async createOperation(@Body() operation: Operation): Promise<void> {
        // TODO ...
        return;
    }

    /**
     *  Trigger operation by id.
     */
    @Response<ErrorResponse>(501, 'Server error')
    @Post('trigger/{operationId}')
    public async triggerOperation(operationId: string): Promise<void> {
        // TODO ...
        return;
    }
}
