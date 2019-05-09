import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { OperationService } from '../../services/operations.service';
import { Operation } from '../../../../../backend/src/models/sharedInterfaces';
import { Subscription } from 'rxjs';
import { CreateOperationDialogComponent } from '../../dialogs/create-operation-dialog/create-operation-dialog.component';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss']
})
export class OperationsComponent implements OnInit, OnDestroy {

  private operationSubscription: Subscription;

  public operations: Operation[] = [];

  constructor(public dialog: MatDialog,
    private operationService: OperationService) {

    this.operationSubscription =
      this.operationService.operationFeed.subscribe((operations: Operation[]) => {
        this.operations = operations;
      });

    this.operationService.retriveOperations();
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.operationSubscription.unsubscribe();
  }

  public createOperation() {
    this.dialog.open(CreateOperationDialogComponent, {
      data: {}
    });
  }

}
