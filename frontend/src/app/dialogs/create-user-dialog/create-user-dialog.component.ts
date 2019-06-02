import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, ErrorStateMatcher } from '@angular/material';
import { Validators, FormControl } from '@angular/forms';
import { UsersService } from '../../services/users.service';

export interface DeviceOption {
  mac: string;
  display: string;
}

class PasswordErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return (invalidCtrl || invalidParent);
  }
}

@Component({
  selector: 'app-create-user-dialog',
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss']
})

export class CreateUserDialogComponent implements OnInit {


  emailControl: FormControl;
  displayNameControl: FormControl;
  ignoreTfaControl: FormControl;
  sessionHouresTimeoutControl: FormControl;
  passwordControl: FormControl;
  passwordSecControl: FormControl;
  scopeControl: FormControl;


  constructor(private usersService: UsersService,
    private dialogRef: MatDialogRef<CreateUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    this.emailControl = new FormControl('', [Validators.required, Validators.email]);
    this.displayNameControl = new FormControl('', [Validators.required]);
    this.ignoreTfaControl = new FormControl('', [Validators.required]);
    this.sessionHouresTimeoutControl = new FormControl('', [Validators.required]);
    this.passwordControl = new FormControl('', [Validators.required]);
    this.passwordSecControl = new FormControl('', [Validators.required]);
    this.scopeControl = new FormControl('', [Validators.required]);

  }

  checkPassword() {

    if (!this.passwordControl.value || this.passwordControl.value.length < 6 || this.passwordControl.value.length > 18) {
      this.passwordControl.setErrors({ strlength: 'The Password length should be between 6 to 18' });
    } else {
      this.passwordControl.setErrors({ strlength: null });
      this.passwordControl.updateValueAndValidity();
    }
  }

  checkPasswordsMatch() {

    if (this.passwordSecControl.value === this.passwordControl.value) {
      this.passwordSecControl.setErrors({ unsame: null });
      this.passwordSecControl.updateValueAndValidity();
    } else {
      this.passwordSecControl.setErrors({ unsame: 'The Password not match other' });
    }
  }

  ngOnInit() {

  }

  public async createUser() {


    await this.usersService.createUser({
      email: this.emailControl.value,
      displayName: this.displayNameControl.value,
      ignoreTfa: this.ignoreTfaControl.value === 'allow',
      password: this.passwordControl.value,
      scope: this.scopeControl.value,
      sessionTimeOutMS: this.sessionHouresTimeoutControl.value * 60 * 1000
    });

    this.dialogRef.close();
  }
}
