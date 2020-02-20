import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Minion, CalibrationMode } from '../../../../../backend/src/models/sharedInterfaces';
import { MinionsService } from '../../services/minions.service';

@Component({
  selector: 'app-calibrate-dialog',
  templateUrl: './calibrate-dialog.component.html',
  styleUrls: ['./calibrate-dialog.component.scss']
})
export class CalibrateDialogComponent implements OnInit {

  minion: Minion;
  isCalibrateActive: boolean;
  minutes = undefined;
  mode: CalibrationMode = 'AUTO';

  constructor(private minionsService: MinionsService, private dialogRef: MatDialogRef<CalibrateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.minion = data;
    this.isCalibrateActive = (this.minion.calibration && this.minion.calibration.calibrationCycleMinutes) ? true : false;

    if (this.isCalibrateActive) {
      this.mode = this.minion.calibration.calibrationMode;
      this.minutes = this.minion.calibration.calibrationCycleMinutes;
    }
  }

  ngOnInit() {
  }

  public async saveCalibrate() {
    let calibrateTime = 0;
    if (this.isCalibrateActive) {
      calibrateTime = this.minutes;
    }

    await this.minionsService.setCalibrate(this.minion, {
      calibrationMode : this.mode,
      calibrationCycleMinutes : calibrateTime
    });
    this.dialogRef.close();
  }
}
