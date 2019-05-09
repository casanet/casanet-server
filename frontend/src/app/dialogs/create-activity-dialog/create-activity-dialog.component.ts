import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { DeviceKind, OperationActivity, Minion, MinionStatus } from '../../../../../backend/src/models/sharedInterfaces';
import { Validators, FormControl } from '@angular/forms';
import { MinionsService } from '../../services/minions.service';
import { DevicesService } from '../../services/devices.service';
import { OperationService } from '../../services/operations.service';
import { CreateMinionDialogComponent } from '../create-minion-dialog/create-minion-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-activity-dialog',
  templateUrl: './create-activity-dialog.component.html',
  styleUrls: ['./create-activity-dialog.component.scss']
})

export class CreateActivityDialogComponent implements OnInit {

  minionControl: FormControl;

  setMinionStatus: FormControl;
  setMinionProperties: FormControl;

  minionPropertiesToSet: any = {};

  private minionsSubscription: Subscription;

  minions: Minion[] = [];

  constructor(
    public dialog: MatDialog,
    private minionsService: MinionsService,
    private dialogRef: MatDialogRef<CreateActivityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.minionsSubscription = minionsService.minionsFeed.subscribe((minions: Minion[]) => {
      this.minions = minions;
    });
  }

  ngOnInit() {

    this.minionControl = new FormControl('', [Validators.required]);
    this.setMinionStatus = new FormControl('', [Validators.required]);
    this.setMinionProperties = new FormControl('');
  }

  public onPropertiesSet() {
    this.setMinionProperties.setValue(this.setMinionProperties);
  }

  public extractStatus(): MinionStatus {
    const selectedMinion: Minion = this.minionControl.value;
    const status: MinionStatus = {};
    status[selectedMinion.minionType] = this.minionPropertiesToSet;
    status[selectedMinion.minionType].status = this.setMinionStatus.value;

    return status;
  }

  public isPropertiesOk() {
    const selectedMinion: Minion = this.minionControl.value;
    const statusToSet: MinionStatus = this.extractStatus();

    if (selectedMinion.minionType === 'airConditioning') {
      const airConditioning = statusToSet.airConditioning;
      return airConditioning.mode &&
        airConditioning.fanStrength &&
        airConditioning.temperature;
    }

    if (selectedMinion.minionType === 'light') {
      const light = statusToSet.light;
      return light.brightness;
    }

    if (selectedMinion.minionType === 'temperatureLight') {
      const temperatureLight = statusToSet.temperatureLight;
      return temperatureLight.brightness &&
        temperatureLight.temperature;
    }

    if (selectedMinion.minionType === 'colorLight') {
      const colorLight = statusToSet.colorLight;
      return colorLight.brightness &&
        colorLight.temperature &&
        colorLight.red &&
        colorLight.green &&
        colorLight.blue;
    }

    if (selectedMinion.minionType === 'roller') {
      const roller = statusToSet.roller;
      return roller.direction;
    }
  }

  public createActivity() {

    this.minionsSubscription.unsubscribe();

    const selectedMinion: Minion = this.minionControl.value;

    const activity: OperationActivity = {
      minionId: selectedMinion.minionId,
      minionStatus: this.extractStatus(),
    };
    this.dialogRef.close(activity);

  }
}
