import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Minion, MinionTimeline, SwitchOptions } from '../../../../../backend/src/models/sharedInterfaces';
import { MinionsService } from '../../services/minions.service';

declare interface MinionTimelineView {
  date: string;
  minionName: string;
  status: { name: string, value: any }[];
  state: SwitchOptions;
}

@Component({
  selector: 'app-timeline-dialog',
  templateUrl: './timeline-dialog.component.html',
  styleUrls: ['./timeline-dialog.component.scss']
})
export class TimelineDialogComponent implements OnInit {

  public timeline: MinionTimelineView[] = [];

  public loading: boolean;

  constructor(private minionsService: MinionsService, private dialogRef: MatDialogRef<TimelineDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.retriveTimeline();
  }

  ngOnInit() {
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  private async retriveTimeline() {
    this.loading = true;
    const timeline = await this.minionsService.getTimeline();
    if (!timeline) {
      return;
    }

    this.timeline = [];

    for (const node of timeline) {
      const { minionId, timestamp } = node;

      const timeStampDate = new Date(timestamp);
      let minion = this.minionsService.getMinion(minionId);
      if (!minion) {
        minion = {
          name: '--',
        } as unknown as Minion;
      }

      let date: string = timeStampDate.toLocaleTimeString();
      if (!this.isToday(timeStampDate)) {
        date += ' ' + timeStampDate.toLocaleDateString();
      }

      let status = [];
      if (node.status[minion.minionType]) {
        status = Object.entries(node.status[minion.minionType]).map((kvp) => {
          return {
            name: kvp[0],
            value: kvp[1],
          };
        }).sort((a, b) => {
          return a < b ? 1 : -1;
        });
      }

      this.timeline.push({
        date,
        minionName: minion.name,
        status,
        state: !node.status || !node.status[minion.minionType] ? 'off' : node.status[minion.minionType].status,
      });
    }

    this.loading = false;
  }
}
