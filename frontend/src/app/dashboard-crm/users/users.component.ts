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

  readonly usersColumns =
    [
      'position',
      'email',
      'displayName',
      'ignoreTfa',
      'scope',
      'save',
      'password',
      'deactivating',
      'register',
      'unregister',
      'remove'
    ];

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
    const { email, displayName, scope, ignoreTfa } = user;

    user['sync'] = true;
    await this.usersService.editUser({
      email,
      displayName,
      scope,
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

    const { email, displayName, scope, ignoreTfa } = user;

    user['psync'] = true;
    await this.usersService.editUser({
      email,
      displayName,
      scope,
      ignoreTfa,
      password: swalResult.value
    });
    user['psync'] = false;
  }

  public async deactivateSEssions(user: User) {
    const swalResult: void | SweetAlertResult = await swal({
      title: `${this.translatePipe.transform('DEACTIVATE_SESSIONS')}`,
      text: `${this.translatePipe.transform('FOR_THE_USER')}: ${user.displayName}`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: this.translatePipe.transform('SUBMIT'),
      cancelButtonText: this.translatePipe.transform('CANCEL')
    });

    // Case user select 'cancel' cancel the delete.
    if (swalResult && swalResult.dismiss) {
      return;
    }

    const { email, displayName, scope, ignoreTfa } = user;

    user['bsync'] = true;
    await this.usersService.deactivateUserSessions({
      email,
      displayName,
      scope,
      ignoreTfa,
      password: swalResult.value
    });
    user['bsync'] = false;
  }

  public async registerUserToRemoteServer(user: User) {


    const swalToContinueResult: void | SweetAlertResult = await swal({
      title: `${this.translatePipe.transform('REGISTER_USER')}`,
      text: `${this.translatePipe.transform('THE_AUTH_CODE_WILL_SEND_TO_ACCOUNT')} ${user.email}`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: this.translatePipe.transform('SEND'),
      cancelButtonText: this.translatePipe.transform('CANCEL')
    });

    /**  Case user select 'cancel' cancel the registeration. */
    if (swalToContinueResult && swalToContinueResult.dismiss) {
      return;
    }

    /** request send user auth code */
    await this.usersService.requestRegistrationCode(user);

    /** Wait for user to enter the sent code */
    const swalResult: void | SweetAlertResult = await swal({
      title: `${this.translatePipe.transform('ENTER_THE_SENT_CODE')}`,
      input: 'text',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: this.translatePipe.transform('SUBMIT'),
      cancelButtonText: this.translatePipe.transform('CANCEL')
    });

    /** Case user select 'cancel' cancel the  */
    if (swalResult && swalResult.dismiss) {
      return;
    }

    /** Send the register request with auth code */
    await this.usersService.requestRegiterUser(user, swalResult.value);
  }

  public async removeUserFromTheRemoteServer(user: User) {

    const swalResult: void | SweetAlertResult = await swal({
      title: `${this.translatePipe.transform('SURE')}?`,
      text: `${user.email} ${this.translatePipe.transform('WILL_REMOVE_FROM_THE_REMOTE_SERVER')}`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonColor: 'red',
      confirmButtonText: this.translatePipe.transform('REMOVE'),
      cancelButtonText: this.translatePipe.transform('CANCEL')
    });

    // Case user select 'cancel' cancel the remove.
    if (swalResult && swalResult.dismiss) {
      return;
    }

    await this.usersService.removeUserFromRemote(user.email);
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
    await this.usersService.deleteUser(user.email);
    user['dsync'] = false;
  }

  public async refreshData() {
    this.dataLoading = true;
    await this.usersService.refreshData();
    this.dataLoading = false;
  }
}
