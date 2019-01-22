import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
// import { AuthService } from '../../core/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

// import { LoadingService } from '../../services/loading/loading.service';
import { AuthService } from '../../services/auth/auth.service';
import swal, { SweetAlertResult } from 'sweetalert2';


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
  validationMessages = {
    'email': {
      'required': 'הזן דוא"ל',
      'email': 'דוא"ל לא תקין'
    },
    'password': {
      'required': 'הזן סיסמה',
      // 'pattern': 'The password must contain numbers and letters',
      'minlength': 'לפחות 6 תווים בסיסמה',
      'maxlength': 'Please enter less than 25 characters',
    },
  };

  constructor(private router: Router,
    private fb: FormBuilder,
    public snackBar: MatSnackBar,
    private authService: AuthService) {
  }

  ngOnInit() {
    this.buildForm();

    // Confign the generic toaster object.
    this.genericToast = swal.mixin({
      toast: true,
      position: 'top-start',
      confirmButtonText: 'סגור',
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
    this.snackBar.open('התחברות בוצעה בהצלחה', 'אישור', {
      duration: 20000,
    });
  }

  private onLoginFail(err: HttpErrorResponse) {

    // this.loadingService.stopLoading();

    if (err.status === 403) {
      this.snackBar.open('שגיאה בהתחברות, נסה שוב', 'אישור', {
        duration: 20000,
      });
      return;
    } else if (err.status === 501) {
      this.genericToast({
        type: 'warning',
        title: 'לא הצלחנו לשלוח מייל אימות',
        text: 'הבעיה היא פנימית בשרת המייל, נא נסה שוב בעוד כמה רגעים',
      });
    } else {
      this.genericToast({
        type: 'warning',
        title: 'שגיאה בלתי צפויה',
        text: 'נא נסה שוב להתחבר בעוד מספר רגעים',
      });
    }
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

