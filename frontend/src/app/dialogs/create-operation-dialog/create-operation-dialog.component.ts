import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatTableDataSource } from '@angular/material';
import { DeviceKind, OperationActivity, Minion, MinionTypes } from '../../../../../backend/src/models/sharedInterfaces';
import { Validators, FormControl } from '@angular/forms';
import { MinionsService } from '../../services/minions.service';
import { DevicesService } from '../../services/devices.service';
import { OperationService } from '../../services/operations.service';
import { CreateActivityDialogComponent } from '../create-activity-dialog/create-activity-dialog.component';
import { Subscription } from 'rxjs';

declare interface ActivityProperties {
  name: string;
  value: string;
}

declare interface Activity {
  name: string;
  status: string;
  properties: ActivityProperties[];
  operationActivity: OperationActivity;
}

@Component({
  selector: 'app-create-operation-dialog',
  templateUrl: './create-operation-dialog.component.html',
  styleUrls: ['./create-operation-dialog.component.scss']
})

export class CreateOperationDialogComponent implements OnInit {


  activitiesControl: FormControl;

  activities: Activity[] = [];

  nameControl: FormControl;
  minions: Minion[] = [];
  minionsSubscription: Subscription;

  displayedColumns: string[] = ['name', 'status', 'properties', 'remove'];
  dataSource: MatTableDataSource<Activity>;

  constructor(
    public dialog: MatDialog,
    private minionsService: MinionsService,
    private operationService: OperationService,
    private dialogRef: MatDialogRef<CreateOperationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) _data) {

    /** Case minoin not,oaded yet. */
    this.minionsService.retriveMinions();

    this.minionsSubscription = this.minionsService.minionsFeed.subscribe((minions: Minion[]) => {
      this.minions = minions;
    });
  }

  ngOnInit() {

  }

  public async createActivity() {
    const dialogRef = this.dialog.open(CreateActivityDialogComponent, {
      data: {}
    });

    const theNewActivity: OperationActivity = await dialogRef.afterClosed().toPromise();

    if (!theNewActivity) {
      return;
    }
    const minion = this.getMinion(theNewActivity.minionId);

    let properties: ActivityProperties[] = Object.entries(theNewActivity.minionStatus[minion.minionType]).map((e) => {
      return {
        /** Upper case for i18n */
        name: e[0],
        value: String(e[1]),
      };
    });

    properties = properties.filter((e) => {
      return e.name !== 'status';
    });

    this.activities.push({
      name: minion.name,
      status: theNewActivity.minionStatus[minion.minionType].status,
      properties,
      operationActivity: theNewActivity,
    });
    this.dataSource = new MatTableDataSource<Activity>(this.activities);
  }


  private getMinion(minionId: string): Minion {
    for (const minion of this.minions) {
      if (minion.minionId === minionId) {
        return minion;
      }
    }
  }

  public removeActivity(activity: Activity) {
    this.activities.splice(this.activities.indexOf(activity), 1);
    this.dataSource = new MatTableDataSource<Activity>(this.activities);
  }

  public async createOperation() {

    await this.operationService.createOperation({
      operationId: 'xxx',
      operationName: this.nameControl.value,
      activities: this.activities.map((act) => act.operationActivity),
    });

    this.minionsSubscription.unsubscribe();
    this.dialogRef.close();
  }
}
