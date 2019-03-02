"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("./dataIO");
const OPERATIONS_FILE_NAME = 'operations.json';
class OperationsDal {
    constructor(dataIo) {
        /**
         * operations.
         */
        this.operations = [];
        this.dataIo = dataIo;
        this.operations = dataIo.getDataSync();
    }
    /**
     * Find operation in operations array
     */
    findOperation(operationId) {
        for (const operation of this.operations) {
            if (operation.operationId === operationId) {
                return operation;
            }
        }
    }
    /**
     * Get all operations as array.
     */
    async getOperations() {
        return this.operations;
    }
    /**
     * Get operation by id.
     * @param minionId operation id.
     */
    async getOperationById(minionId) {
        const operation = this.findOperation(minionId);
        if (!operation) {
            throw {
                responseCode: 3404,
                message: 'operation not exist',
            };
        }
        return operation;
    }
    /**
     * Save new operation.
     * @param newOperation operation to create.
     */
    async createOperation(newOperation) {
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
    async deleteOperation(operationId) {
        const originalMinion = this.findOperation(operationId);
        if (!originalMinion) {
            throw {
                responseCode: 3404,
                message: 'operation not exist',
            };
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
    async updateOperation(operation) {
        const originalOperation = this.findOperation(operation.operationId);
        if (!originalOperation) {
            throw {
                responseCode: 3404,
                message: 'operation not exist',
            };
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
exports.OperationsDal = OperationsDal;
exports.OperationsDalSingleton = new OperationsDal(new dataIO_1.DataIO(OPERATIONS_FILE_NAME));
//# sourceMappingURL=operationsDal.js.map