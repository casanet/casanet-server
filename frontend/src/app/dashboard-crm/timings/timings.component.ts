import { Component, OnInit } from '@angular/core';
import { OperationService } from '../../services/operations.service';
import { TimingsService } from '../../services/timings.service';
import { TranslateService } from '../../translate.service';
import { TranslatePipe } from '../../translate.pipe';
import { Timing } from '../../../../../backend/src/models/sharedInterfaces';
import swal, { SweetAlertResult } from 'sweetalert2';
import { CreateTimingDialogComponent } from '../../dialogs/create-timing-dialog/create-timing-dialog.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-timings',
  templateUrl: './timings.component.html',
  styleUrls: ['./timings.component.scss']
})
export class TimingsComponent implements OnInit {

  private translatePipe: TranslatePipe;

  constructor(
    public dialog: MatDialog,
    private translateService: TranslateService,
    private operationService: OperationService,
    private timingsService: TimingsService) {

    this.translatePipe = new TranslatePipe(this.translateService);

    this.operationService.retriveOperations();
  }

  ngOnInit() {
  }

  public createTimings() {
    this.dialog.open(CreateTimingDialogComponent, {
      data: {}
    });
  }

  public async deleteTiming(timing: Timing) {
    const swalResult: void | SweetAlertResult = await swal({
      type: 'warning',
      title: `${this.translatePipe.transform('SURE')}?`,
      text: `${this.translatePipe.transform('BEFORE_DELETE_TIMING_MESSAGE')} ${timing.timingName} ?`,
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
}
