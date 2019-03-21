"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsoa_1 = require("tsoa");
const operationsBl_1 = require("../business-layer/operationsBl");
let OperationsController = class OperationsController extends tsoa_1.Controller {
    /**
     * Get all operations in the system.
     * @returns Operations array.
     */
    async getOperations() {
        return await operationsBl_1.OperationsBlSingleton.getOperations();
    }
    /**
     * Get operation by id.
     * @returns Operation.
     */
    async getOperation(operationId) {
        return await operationsBl_1.OperationsBlSingleton.getOperationById(operationId);
    }
    /**
     * Update operation properties.
     * @param operationId OperationId id.
     * @param operation Operation object to update to.
     */
    async setOperation(operationId, operation) {
        return await operationsBl_1.OperationsBlSingleton.SetOperation(operationId, operation);
    }
    /**
     * Delete operation from the system.
     * @param operationId Operation id.
     */
    async deleteOperation(operationId) {
        return await operationsBl_1.OperationsBlSingleton.DeleteOperation(operationId);
    }
    /**
     * Creates a new operation.
     * @param operation The new operation to create.
     */
    async createOperation(operation) {
        return await operationsBl_1.OperationsBlSingleton.CreateOperation(operation);
    }
    /**
     * Invoke operation.
     * @param operationId Operation id.
     * @returns Array of minions set status errors (if any).
     */
    async triggerOperation(operationId) {
        return await operationsBl_1.OperationsBlSingleton.triggerOperation(operationId);
    }
};
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get()
], OperationsController.prototype, "getOperations", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Get('{operationId}')
], OperationsController.prototype, "getOperation", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Put('{operationId}'),
    __param(1, tsoa_1.Body())
], OperationsController.prototype, "setOperation", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Delete('{operationId}')
], OperationsController.prototype, "deleteOperation", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post(),
    __param(0, tsoa_1.Body())
], OperationsController.prototype, "createOperation", null);
__decorate([
    tsoa_1.Security('userAuth'),
    tsoa_1.Security('adminAuth'),
    tsoa_1.Response(501, 'Server error'),
    tsoa_1.Post('trigger/{operationId}')
], OperationsController.prototype, "triggerOperation", null);
OperationsController = __decorate([
    tsoa_1.Tags('Operations'),
    tsoa_1.Route('operations')
], OperationsController);
exports.OperationsController = OperationsController;
//# sourceMappingURL=operationsController.js.map