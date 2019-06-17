import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Minion, MinionStatus, Operation } from '../../../../backend/src/models/sharedInterfaces';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DeepCopy } from '../../../../backend/src/utilities/deepCopy';
import { ToasterAndErrorsService } from './toaster-and-errors.service';

@Injectable({
  providedIn: 'root'
})
export class OperationService {

  private isOperationsRetrived = false;

  private operations: Operation[] = [];
  public operationFeed: BehaviorSubject<Operation[]> = new BehaviorSubject<Operation[]>(this.operations);

  constructor(private toastrAndErrorsService: ToasterAndErrorsService,
    private httpClient: HttpClient) {

    this.retriveData();
  }

  private async loadOperations() {
    try {
      const operations = await this.httpClient.get<Operation[]>('/API/operations').toPromise();
      operations.sort((itemA, itemB) => {
        return itemA.operationName < itemB.operationName ? -1 : 1;
      });
      this.operations = operations;
      this.operationFeed.next(this.operations);
    } catch (error) {
      this.isOperationsRetrived = false;
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  private async retriveOperations() {
    if (!this.isOperationsRetrived) {
      this.isOperationsRetrived = true;
      await this.loadOperations();
    }
  }

  public async createOperation(operation: Operation) {
    try {
      await this.httpClient.post('/API/operations', operation).toPromise();
      this.loadOperations();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async deleteOperation(operation: Operation) {
    try {
      await this.httpClient.delete(`/API/operations/${operation.operationId}`).toPromise();
      this.loadOperations();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public getOperation(operationId: string): Operation {
    for (const operation of this.operations) {
      if (operation.operationId === operationId) {
        return operation;
      }
    }
  }

  public async triggerOperation(operation: Operation) {
    try {
      await this.httpClient.post(`/API/operations/trigger/${operation.operationId}`, undefined).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async refreshData() {
    await this.loadOperations();
  }

  public async cleanUp() {
    this.isOperationsRetrived = false;
    this.operations = [];
  }

  public async retriveData() {
    this.retriveOperations();
  }
}
