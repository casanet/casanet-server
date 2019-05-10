import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
// import { AuthService } from '../../core/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

// import { LoadingService } from '../../services/loading/loading.service';
import { AuthService } from '../../services/auth/auth.service';
import swal, { SweetAlertResult } from 'sweetalert2';
import { TranslatePipe } from '../../translate.pipe';
import { TranslateService } from '../../translate.service';
import { ToasterAndErrorsService } from '../../services/toaster-and-errors.service';
import { MinionsService } from '../../services/minions.service';
import { DevicesService } from '../../services/devices.service';
import { OperationService } from '../../services/operations.service';
import { TimingsService } from '../../services/timings.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  waitingForTfa = false;
  private genericToast: typeof swal;

  userForm: FormGroup;
  formErrors = {
    'email': '',
    'password': '',
  };
  private validationMessages;

  private translatePipe: TranslatePipe;

  constructor(private router: Router,
    private fb: FormBuilder,
    public snackBar: MatSnackBar,
    private authService: AuthService,
    private minionsService: MinionsService,
		private devicesService: DevicesService,
		private operationService: OperationService,
		private timingsService: TimingsService,
    private translateService: TranslateService,
    private toastrAndErrorsService: ToasterAndErrorsService) {
    this.translatePipe = new TranslatePipe(this.translateService);

    this.validationMessages = {
      'email': {
        'required': this.translatePipe.transform('ENTER_EMAIL'),
        'email': this.translatePipe.transform('INCORRECT_EMAIL')
      },
      'password': {
        'required': this.translatePipe.transform('ENTER_PASSWORD'),
        // 'pattern': 'The password must contain numbers and letters',
        'minlength': this.translatePipe.transform('MIN_PASSWORD_LENGTH_MSG'),
        'maxlength': this.translatePipe.transform('MAX_PASSWORD_LENGTH_MSG')
      },
    };
  }

  ngOnInit() {
    this.buildForm();

    // Confign the generic toaster object.
    this.genericToast = swal.mixin({
      toast: true,
      position: 'top-start',
      confirmButtonText: this.translatePipe.transform('CLOSE'),
      showConfirmButton: true,
      timer: 60 * 20 * 1000
    });
  }

  ngAfterViewInit() {
    // this.loadingService.stopLoading();
  }

  buildForm() {
    this.userForm = this.fb.group({
      'email': ['', [
        Validators.required,
        Validators.email
      ]
      ],
      'password': ['', [
        // Validators.pattern('^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$'),
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(25)
      ]
      ],
    });

    this.userForm.valueChanges.subscribe(data => this.onValueChanged(data));
    this.onValueChanged();
  }

  onValueChanged(data?: any) {
    if (!this.userForm) {
      return;
    }
    const form = this.userForm;
    for (const field in this.formErrors) {
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field)) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  private onLoginSuccess() {
    this.router.navigate(['/']);
    this.snackBar.open(this.translatePipe.transform('LOGIN_SUCCESSFULLY'), this.translatePipe.transform('SUBMIT'), {
      duration: 20000,
    });

    this.minionsService.retriveData();
    this.operationService.retriveData();
    this.devicesService.retriveData();
    this.timingsService.retriveData();
  }

  private onLoginFail(err: HttpErrorResponse) {

    // this.loadingService.stopLoading();

    if (err.status === 403 || err.status === 401) {
      this.snackBar.open(this.translatePipe.transform('CONNECTED_FAIL'), this.translatePipe.transform('SUBMIT'), {
        duration: 20000,
      });
      return;
    }

    this.toastrAndErrorsService.OnHttpError(err);
  }

  public async login() {

    const authData = this.userForm.getRawValue();
    // this.loadingService.startLoading('מתחבר...');

    if (!this.waitingForTfa) {
      await this.authService.login(authData.email, authData.password)
        .then(((isNeedTfa: boolean) => {
          if (!isNeedTfa) {
            this.onLoginSuccess();
            return;
          }
          // this.loadingService.stopLoading();
          this.waitingForTfa = true;
          this.userForm.setValue({
            email: authData.email,
            password: '',
          });
          this.formErrors.password = undefined;
        }).bind(this))
        .catch(((err: HttpErrorResponse) => {
          this.onLoginFail(err);
        }).bind(this));
    } else {
      await this.authService.loginTfa(authData.email, authData.password)
        .then((() => {
          this.onLoginSuccess();
          this.waitingForTfa = false;
        }).bind(this))
        .catch(((err: HttpErrorResponse) => {
          this.onLoginFail(err);
        }).bind(this));
    }


  }
}

