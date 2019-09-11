import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Minion } from '../../../../../backend/src/models/sharedInterfaces';
import { MinionsService } from '../../services/minions.service';

@Component({
  selector: 'app-calibrate-dialog',
  templateUrl: './calibrate-dialog.component.html',
  styleUrls: ['./calibrate-dialog.component.scss']
})
export class CalibrateDialogComponent implements OnInit {

  minion: Minion;
  isCalibrateActive: boolean;
  minutes = 0;
  constructor(private minionsService: MinionsService, private dialogRef: MatDialogRef<CalibrateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.minion = data;
    this.isCalibrateActive = this.minion.calibrationCycleMinutes ? true : false;

    if (this.isCalibrateActive) {
      this.minutes = this.minion.calibrationCycleMinutes;
    }
  }

  ngOnInit() {
  }

  public async saveCalibrate() {
    let calibrateTime = 0;
    if (this.isCalibrateActive) {
      calibrateTime = this.minutes;
    }

    await this.minionsService.setCalibrate(this.minion, calibrateTime);
    this.dialogRef.close();
  }
}
