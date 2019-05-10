import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { OperationService } from '../../services/operations.service';
import { OperationActivity, Operation } from '../../../../../backend/src/models/sharedInterfaces';
import { Subscription } from 'rxjs';
import { CreateOperationDialogComponent } from '../../dialogs/create-operation-dialog/create-operation-dialog.component';
import { MinionsService } from '../../services/minions.service';
import swal, { SweetAlertResult } from 'sweetalert2';
import { TranslateService } from '../../translate.service';
import { TranslatePipe } from '../../translate.pipe';


export declare interface ActivityProperties {
  name: string;
  value: string;
}

export declare interface Activity {
  name: string;
  status: string;
  properties: ActivityProperties[];
  operationActivity: OperationActivity;
}

declare interface OperationDisplay extends Operation {
  activitiesDisplay: Activity[];
}

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss']
})
export class OperationsComponent implements OnInit, OnDestroy {

  private operationSubscription: Subscription;
  private minionsSubscription: Subscription;
  private translatePipe: TranslatePipe;

  public operations: OperationDisplay[] = [];
  public rawOperations: Operation[] = [];

  public readonly activityColumns = ['name', 'status', 'properties'];
  constructor(public dialog: MatDialog,
    private translateService: TranslateService,
    private minionsService: MinionsService,
    private operationService: OperationService) {

    this.translatePipe = new TranslatePipe(this.translateService);
    /** Case minoin not,oaded yet. */
    this.minionsService.retriveMinions();

    this.minionsSubscription = this.minionsService.minionsFeed.subscribe((minoins) => {
      /** load names agine after minions update */
      this.parseOperations();
    });

    this.operationSubscription =
      this.operationService.operationFeed.subscribe((operations: Operation[]) => {
        this.rawOperations = operations;
        this.parseOperations();
      });

    this.operationService.retriveOperations();
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.minionsSubscription.unsubscribe();
    this.operationSubscription.unsubscribe();
  }

  private parseOperations() {
    this.operations = [];
    /** translate operation to OperationDisplay */

    for (const operation of this.rawOperations) {

      const { operationId, operationName, activities } = operation;
      const activitiesDisplay: Activity[] = activities.map((operationActivity): Activity => {
        const minion = this.minionsService.getMinion(operationActivity.minionId);

        if (!minion) {
          return {
            name: '--',
            status: '--',
            properties: [],
            operationActivity,
          };
        }
        let properties: ActivityProperties[] =
          Object.entries(operationActivity.minionStatus[minion.minionType]).map((e) => {
            return {
              /** Upper case for i18n */
              name: e[0],
              value: String(e[1]),
            };
          });

        properties = properties.filter((e) => {
          return e.name !== 'status';
        });

        return {
          name: minion.name,
          status: operationActivity.minionStatus[minion.minionType].status,
          operationActivity: operationActivity,
          properties,
        };
      });

      this.operations.push({
        activities,
        operationId,
        operationName,
        activitiesDisplay,
      });
    }
  }

  public createOperation() {
    this.dialog.open(CreateOperationDialogComponent, {
      data: {}
    });
  }

  public async triggerOperation(operation: Operation) {
    operation['sync'] = true;
    await this.operationService.triggerOperation(operation);
    operation['sync'] = false;
  }

  public async deleteOperation(operation: Operation) {
    const swalResult: void | SweetAlertResult = await swal({
      type: 'warning',
      title: `${this.translatePipe.transform('SURE')}?`,
      text: `${this.translatePipe.transform('BEFORE_DELETE_MESSAGE')} ${operation.operationName} ?`,
      showConfirmButton: true,
      confirmButtonColor: 'red',
      showCancelButton: true,
      confirmButtonText: this.translatePipe.transform('DELETE'),
      cancelButtonText: this.translatePipe.transform('CANCEL')
    });

    // Case user select 'cancel' cancel the delete.
    if (swalResult && swalResult.dismiss) {
      return;
    }

    operation['sync'] = true;
    await this.operationService.deleteOperation(operation);
    operation['sync'] = false;
  }
}
