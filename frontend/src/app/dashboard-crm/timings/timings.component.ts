import { Component, OnInit, OnDestroy } from '@angular/core';
import { OperationService } from '../../services/operations.service';
import { TimingsService } from '../../services/timings.service';
import { TranslateService } from '../../translate.service';
import { TranslatePipe } from '../../translate.pipe';
import { Timing } from '../../../../../backend/src/models/sharedInterfaces';
import swal, { SweetAlertResult } from 'sweetalert2';
import { CreateTimingDialogComponent } from '../../dialogs/create-timing-dialog/create-timing-dialog.component';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { DeepCopy } from '../../../../../backend/src/utilities/deepCopy';

declare interface DisplayTiming extends Timing {
  operationName: string;
}

@Component({
  selector: 'app-timings',
  templateUrl: './timings.component.html',
  styleUrls: ['./timings.component.scss']
})

export class TimingsComponent implements OnInit, OnDestroy {


  private translatePipe: TranslatePipe;
  private timingsSubscription: Subscription;
  private operationsSubscription: Subscription;

  timings: DisplayTiming[] = [];
  rawTimings: Timing[] = [];

  constructor(
    public dialog: MatDialog,
    private translateService: TranslateService,
    private operationService: OperationService,
    private timingsService: TimingsService) {

    this.translatePipe = new TranslatePipe(this.translateService);

    this.operationService.retriveOperations();
    this.timingsService.retriveTimings();

    this.operationsSubscription =
      this.operationService.operationFeed.subscribe((operations) => {
        this.parseTimings();
      });

    this.timingsSubscription =
      this.timingsService.timingsFeed.subscribe((timings) => {
        this.rawTimings = timings;
        this.parseTimings();
      });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.operationsSubscription.unsubscribe();
    this.timingsSubscription.unsubscribe();
  }

  public createTimings() {
    this.dialog.open(CreateTimingDialogComponent, {
      data: {}
    });
  }

  public async setTimingActive(timing: Timing, setActive: boolean) {

    timing['sync'] = true;
    const originalTiming = DeepCopy<Timing>(this.timingsService.getTiming(timing.timingId));
    originalTiming.isActive = setActive;

    await this.timingsService.editTimings(originalTiming);

    timing['sync'] = false;
  }

  public async deleteTiming(timing: Timing) {
    const swalResult: void | SweetAlertResult = await swal({
      type: 'warning',
      title: `${this.translatePipe.transform('SURE')}?`,
      text: `${this.translatePipe.transform('BEFORE_DELETE_MESSAGE')} ${timing.timingName} ?`,
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

    timing['sync'] = true;
    await this.timingsService.deleteTiming(timing);
    timing['sync'] = false;
  }

  public getDataFromUTC(utcTime: number): Date {
    new Date(utcTime).toLocaleDateString();
    new Date(utcTime).toLocaleTimeString();
    return new Date(utcTime);
  }

  private parseTimings() {
    this.timings = this.rawTimings.map((timing): DisplayTiming => {
      const { isActive, timingId, timingName, timingProperties, timingType, triggerOperationId } = timing;
      const operation = this.operationService.getOperation(timing.triggerOperationId);
      const operationName =
        operation
          ? operation.operationName
          : '--';
      return {
        isActive,
        operationName,
        timingId,
        timingName,
        timingProperties,
        timingType,
        triggerOperationId
      };
    });
    this.timings.sort((itemA, itemB) => {
      /** If type is the same, sort by display name */
      if (itemA.timingType === itemA.timingType) {
        return itemA.timingName < itemB.timingName ? -1 : 1;
      }
      return itemA.timingType < itemB.timingType ? -1 : 1;
    });
  }
}
