import { Injectable } from '@angular/core';
import swal, { SweetAlertResult } from 'sweetalert2';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslateService } from '../../translate.service';
import { TranslatePipe } from '../../translate.pipe';
import { ErrorResponse } from '../../../../../backend/src/models/sharedInterfaces';

@Injectable({
  providedIn: 'root'
})
export class ToasterAndErrorsService {

  private genericToast: typeof swal;
  private translatePipe: TranslatePipe;

  constructor(private translateService: TranslateService, private router: Router) {
    this.translatePipe = new TranslatePipe(this.translateService);

    this.genericToast = swal.mixin({
      toast: true,
      position: 'top-start',
      confirmButtonText: 'סגור',
      showConfirmButton: true,
      timer: 20 * 1000
    });
  }

  public OnHttpError(httpErrorResponse: HttpErrorResponse) {
    if (httpErrorResponse.status === 403) {
      this.router.navigate(['/login']);
      return;
    }

    if (httpErrorResponse.status === 0) {
      this.genericToast({
        type: 'error',
        title: this.translatePipe.transform('REQUEST_FAIL'),
        text: this.translatePipe.transform(0, true),
      });
      return;
    }

    if (httpErrorResponse.error['responseCode'] !== undefined) {
      const errorResponse: ErrorResponse = httpErrorResponse.error;
      this.genericToast({
        type: 'error',
        title: this.translatePipe.transform('REQUEST_FAIL'),
        text: this.translatePipe.transform(errorResponse.responseCode, true),
      });
      return;
    }

    this.genericToast({
      type: 'error',
      title: this.translatePipe.transform('REQUEST_FAIL'),
      text: this.translatePipe.transform(httpErrorResponse.status, true),
    });
  }
}
