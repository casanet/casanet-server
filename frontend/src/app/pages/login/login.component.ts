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
import { UsersService } from '../../services/users.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  waitingForTfa = false;
  localServerId = '';
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
    private usersService: UsersService,
    private translateService: TranslateService,
    private toastrAndErrorsService: ToasterAndErrorsService) {
    this.translatePipe = new TranslatePipe(this.translateService);

    document.getElementById('loading-app-assets').innerHTML = '';

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
      duration: 2000,
    });

    this.minionsService.retriveData();
    this.operationService.retriveData();
    this.devicesService.retriveData();
    this.timingsService.retriveData();
    this.usersService.retriveData();

  }

  private onLoginFail(err: HttpErrorResponse) {

    // this.loadingService.stopLoading();

    if (err.status === 403 || err.status === 401) {
      this.snackBar.open(this.translatePipe.transform('CONNECTED_FAIL'), this.translatePipe.transform('SUBMIT'), {
        duration: 2000,
      });
      return;
    }

    this.toastrAndErrorsService.OnHttpError(err);
  }

  public async login() {

    const authData = this.userForm.getRawValue();

    if (this.waitingForTfa) {
      try {
        await this.authService.loginTfa(authData.email, authData.password, this.localServerId);
        this.onLoginSuccess();
      } catch (error) {
        this.onLoginFail(error);
      }
      return;
    }


    try {
      const res = await this.authService.login(authData.email, authData.password, this.localServerId);
      if (res.status === 200) {
        this.onLoginSuccess();
        return;
      }

      if (res.status === 201) {
        this.waitingForTfa = true;
        this.userForm.setValue({
          email: authData.email,
          password: '',
        });
        this.formErrors.password = undefined;
        return;
      }

      if (res.status === 210) {

        const servers: { displayName: string; localServerId: string; }[] = res.body as any;
        const selectOptions = servers.reduce((kpv, server) => {
          kpv[server.localServerId] = server.displayName;
          return kpv;
        }, {});

        const swalResult: void | SweetAlertResult = await swal({
          title: `${this.translatePipe.transform('SELECT_LOCAL_SERVER')}`,
          input: 'select',
          inputOptions: selectOptions,
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: this.translatePipe.transform('SUBMIT'),
          cancelButtonText: this.translatePipe.transform('CANCEL')
        });

        // Case user select 'cancel' cancel the delete.
        if (swalResult && swalResult.dismiss) {
          return;
        }

        this.localServerId = swalResult.value;
        this.login();
      }
    } catch (error) {
      this.onLoginFail(error);
    }

  }
}

