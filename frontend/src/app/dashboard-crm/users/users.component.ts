import { Component, OnInit, OnDestroy } from '@angular/core';
import { UsersService } from '../../services/users.service';
import { User } from '../../../../../backend/src/models/sharedInterfaces';
import { Subscription } from 'rxjs';
import { TranslateService } from '../../translate.service';
import { TranslatePipe } from '../../translate.pipe';
import { CreateUserDialogComponent } from '../../dialogs/create-user-dialog/create-user-dialog.component';
import { MatDialog } from '@angular/material';
import swal, { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {

  private translatePipe: TranslatePipe;

  public dataLoading = false;

  users: User[] = [];
  usersSubscription: Subscription;

  readonly usersColumns = ['position', 'email', 'displayName', 'ignoreTfa', 'sessionTimeOutMS', 'scope', 'save', 'password', 'remove'];

  constructor(
    public dialog: MatDialog,
    private translateService: TranslateService,
    private usersService: UsersService
  ) {

    this.translatePipe = new TranslatePipe(this.translateService);

    this.usersSubscription =
      this.usersService.usersFeed.subscribe((users) => {
        this.users = users;
      });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.usersSubscription.unsubscribe();
  }

  public async updateUser(user: User) {
    const { email, displayName, scope, sessionTimeOutMS, ignoreTfa } = user;

    user['sync'] = true;
    await this.usersService.editUser({
      email,
      displayName,
      scope,
      sessionTimeOutMS,
      ignoreTfa,
    });

    user['sync'] = false;
  }

  public createUser() {
    this.dialog.open(CreateUserDialogComponent, {
      data: {}
    });
  }


  public async changePassword(user: User) {
    const swalResult: void | SweetAlertResult = await swal({
      title: `${this.translatePipe.transform('SET_PASSWORD')}`,
      text: `${this.translatePipe.transform('FOR_THE_USER')}: ${user.displayName}`,
      input: 'password',
      onOpen: () => {
        swal.disableConfirmButton();
        swal.getInput().addEventListener('input', (e: KeyboardEvent) => {
          if (!e.target['value']) {
            swal.disableConfirmButton();
            return;
          }

          const pass: string = e.target['value'];

          if (pass.length < 6 || pass.length > 18) {
            swal.disableConfirmButton();
            return;
          }

          swal.enableConfirmButton();
        });
      },
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: this.translatePipe.transform('SUBMIT'),
      cancelButtonText: this.translatePipe.transform('CANCEL')
    });

    // Case user select 'cancel' cancel the delete.
    if (swalResult && swalResult.dismiss) {
      return;
    }

    const { email, displayName, scope, sessionTimeOutMS, ignoreTfa } = user;

    user['psync'] = true;
    await this.usersService.editUser({
      email,
      displayName,
      scope,
      sessionTimeOutMS,
      ignoreTfa,
      password: swalResult.value
    });
    user['psync'] = false;
  }

  public async deleteUser(user: User) {
    const swalResult: void | SweetAlertResult = await swal({
      type: 'warning',
      title: `${this.translatePipe.transform('SURE')}?`,
      text: `${this.translatePipe.transform('BEFORE_DELETE_MESSAGE')} ${user.displayName} ?`,
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

    user['dsync'] = true;
    await this.usersService.deleteUser(user);
    user['dsync'] = false;
  }

  public async refreshData() {
    this.dataLoading = true;
    await this.usersService.refreshData();
    this.dataLoading = false;
  }
}
