import { IDataIO } from '../models/backendInterfaces';
import { ErrorResponse, Operation } from '../models/sharedInterfaces';
import { DataIO } from './dataIO';

const OPERATIONS_FILE_NAME = 'operations.json';

export class OperationsDal {

    private dataIo: IDataIO;

    /**
     * operations.
     */
    private operations: Operation[] = [];

    constructor(dataIo: IDataIO) {
        this.dataIo = dataIo;

        this.operations = dataIo.getDataSync();
    }

    /**
     * Find operation in operations array
     */
    private findOperation(operationId: string): Operation {
        for (const operation of this.operations) {
            if (operation.operationId === operationId) {
                return operation;
            }
        }
    }

    /**
     * Get all operations as array.
     */
    public async getOperations(): Promise<Operation[]> {
        return this.operations;
    }

    /**
     * Get operation by id.
     * @param minionId operation id.
     */
    public async getOperationById(minionId: string): Promise<Operation> {
        const operation = this.findOperation(minionId);

        if (!operation) {
            throw new Error('operation not exist');
        }
        return operation;
    }

    /**
     * Save new operation.
     * @param newOperation operation to create.
     */
    public async createOperation(newOperation: Operation): Promise<void> {
        this.operations.push(newOperation);

        await this.dataIo.setData(this.operations)
            .catch(() => {
                this.operations.splice(this.operations.indexOf(newOperation), 1);
                throw new Error('fail to save operation');
            });
    }

    /**
     * Delete operation.
     * @param operation operation to delete.
     */
    public async deleteOperation(operationId: string): Promise<void> {
        const originalMinion = this.findOperation(operationId);

        if (!originalMinion) {
            throw new Error('operation not exist');
        }

        this.operations.splice(this.operations.indexOf(originalMinion), 1);
        await this.dataIo.setData(this.operations)
            .catch(() => {
                this.operations.push(originalMinion);
                throw new Error('fail to save operation delete request');
            });
    }

    /**
     * Update operation.
     * @param operation operation to update.
     */
    public async updateOperation(operation: Operation): Promise<void> {
        const originalOperation = this.findOperation(operation.operationId);

        if (!originalOperation) {
            throw {
                responseCode : 4004,
                message: 'operation not exist',
            } as ErrorResponse;
        }

        this.operations.splice(this.operations.indexOf(originalOperation), 1);
        this.operations.push(operation);
        await this.dataIo.setData(this.operations)
            .catch(() => {
                this.operations.splice(this.operations.indexOf(operation), 1);
                this.operations.push(originalOperation);
                throw new Error('fail to save operation update request');
            });
    }
}

export const OperationsDalSingleton = new OperationsDal(new DataIO(OPERATIONS_FILE_NAME));
