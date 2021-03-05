import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Minion } from '../../../../../backend/src/models/sharedInterfaces';
import { MinionsService } from '../../services/minions.service';

@Component({
  selector: 'app-auto-timeout-dialog',
  templateUrl: './auto-timeout-dialog.component.html',
  styleUrls: ['./auto-timeout-dialog.component.scss']
})
export class AutoTimeoutDialogComponent implements OnInit {

  minion: Minion;
  isAutoTimeoutActive: boolean;
  hours = 1;
  minutes = 0;
  seconds = 0;
  constructor(private minionsService: MinionsService, private dialogRef: MatDialogRef<AutoTimeoutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.minion = data;
    this.isAutoTimeoutActive = this.minion.minionAutoTurnOffMS ? true : false;

    if (this.isAutoTimeoutActive) {
      this.seconds = (Math.floor(this.minion.minionAutoTurnOffMS / 100) / 10) % 60;
      this.minutes = Math.floor(this.minion.minionAutoTurnOffMS * 0.00001667) % 60;
      this.hours = Math.floor(this.minion.minionAutoTurnOffMS * 2.8e-7);
    }
  }

  ngOnInit() {
  }

  public async saveAutoTimeout() {
    let autoTimeout = 0;
    if (this.isAutoTimeoutActive) {
      autoTimeout = (this.seconds * 1000) + (this.minutes * 1000 * 60) + (this.hours * 1000 * 60 * 60);
    }

    await this.minionsService.setAutoTimeout(this.minion, autoTimeout);
    this.dialogRef.close();
  }
}
