import {
  Body,
  Controller,
  Delete,
  Deprecated,
  Get,
  Header,
  Path,
  Post,
  Put,
  Query,
  Response,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { OperationsBlSingleton } from '../business-layer/operationsBl';
import { ErrorResponse, Operation, OperationResult } from '../models/sharedInterfaces';

/**
 * @deprecated - Use Timing API directly
 */
@Tags('Operations')
@Route('operations')
@Deprecated()
export class OperationsController extends Controller {
  /**
   * Get all operations in the system.
   * @returns Operations array.
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get()
	@Deprecated()
  public async getOperations(): Promise<Operation[]> {
    return await OperationsBlSingleton.getOperations();
  }

  /**
   * Get operation by id.
   * @returns Operation.
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Get('{operationId}')
	@Deprecated()
  public async getOperation(operationId: string): Promise<Operation> {
    return await OperationsBlSingleton.getOperationById(operationId);
  }

  /**
   * Update operation properties.
   * @param operationId OperationId id.
   * @param operation Operation object to update to.
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Put('{operationId}')
	@Deprecated()
  public async setOperation(operationId: string, @Body() operation: Operation): Promise<void> {
    return await OperationsBlSingleton.SetOperation(operationId, operation);
  }

  /**
   * Delete operation from the system.
   * @param operationId Operation id.
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Delete('{operationId}')
	@Deprecated()
  public async deleteOperation(operationId: string): Promise<void> {
    return await OperationsBlSingleton.DeleteOperation(operationId);
  }

  /**
   * Creates a new operation.
   * @param operation The new operation to create.
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Post()
	@Deprecated()
  public async createOperation(@Body() operation: Operation): Promise<void> {
    return await OperationsBlSingleton.CreateOperation(operation);
  }

  /**
   * Invoke operation.
   * @param operationId Operation id.
   * @returns Array of minions set status errors (if any).
   */
  @Security('adminAuth')
  @Response<ErrorResponse>(501, 'Server error')
  @Post('trigger/{operationId}')
	@Deprecated()
  public async triggerOperation(operationId: string): Promise<OperationResult[]> {
    return await OperationsBlSingleton.triggerOperationById(operationId);
  }
}
