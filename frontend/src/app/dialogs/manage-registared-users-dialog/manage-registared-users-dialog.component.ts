import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatTableDataSource } from '@angular/material';
import { UsersService } from '../../services/users.service';
import { Subscription } from 'rxjs';
import swal, { SweetAlertResult } from 'sweetalert2';
import { TranslateService } from '../../translate.service';
import { TranslatePipe } from '../../translate.pipe';

@Component({
  selector: 'app-manage-registared-users-dialog-dialog',
  templateUrl: './manage-registared-users-dialog.component.html',
  styleUrls: ['./manage-registared-users-dialog.component.scss']
})

export class ManageRegisteredUsersComponent implements OnInit {

  displayedColumns: string[] = ['name', 'remove'];
  users: string[];
  public loading: boolean;

  private translatePipe: TranslatePipe;
  constructor(
    public dialog: MatDialog,
    private usersService: UsersService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<ManageRegisteredUsersComponent>,
    @Inject(MAT_DIALOG_DATA) _data) {

    this.translatePipe = new TranslatePipe(this.translateService);
    this.loadUsers();
  }

  ngOnInit() {

  }

  private async loadUsers() {
    this.loading = true;
    this.users = await this.usersService.getRegisteredUsers();
    this.loading = false;
  }

  public async deleteUser(user: string) {
    const swalResult: void | SweetAlertResult = await swal({
      type: 'warning',
      title: `${this.translatePipe.transform('SURE')}?`,
      text: `${this.translatePipe.transform('BEFORE_DELETE_MESSAGE')} ${user} ?`,
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

    this.loading = true;
    await this.usersService.removeUserFromRemote(user);
    await this.loadUsers();
  }
}
