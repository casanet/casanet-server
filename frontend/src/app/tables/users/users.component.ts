import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UsersService } from '../../services/data/users.service';
import { Observable, Subscriber, BehaviorSubject, Subscription } from 'rxjs';
import { AccessMap } from './usersViewStrings';
import swal, { SweetAlertResult } from 'sweetalert2';

@Component({
   selector: 'app-users',
   templateUrl: './users.component.html',
   styleUrls: ['./users.component.scss']
})

export class UsersComponent implements OnInit, OnDestroy {

   private genericToast: typeof swal;

   accessMap: { [key: string]: string } = AccessMap;
   accessList: string[] = Object.keys(this.accessMap);
   toppingList: OptionItem[];

   filterBy: string;

   subscription: Subscription;
   constructor(private usersService: UsersService) {
   }

   /**
      * Handle the HTTP error response.
      * @param errRes The HTTP error response.
      */
   private handelErrorResponse(errRes: HttpErrorResponse): void {

      let errorText = '';

      switch (errRes.status) {
         case 403:
            errorText = 'אינך מורשה לביצוע הפעולה';
            break;
         case 422:
            errorText = 'טופס הנתונים לא הוזן כראוי';
            break;
         case 501:
            errorText = 'שגיאת שרת פנימית';
            break;
      }

      this.genericToast({
         type: 'warning',
         title: 'הבקשה לא הצליחה',
         text: errorText,
      });
   }

   private daysAndHoursToMS(days: number, hours: number): number {
      return (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);
   }

   ngOnInit() {
      this.genericToast = swal.mixin({
         toast: true,
         position: 'top-start',
         confirmButtonText: 'סגור',
         showConfirmButton: true,
         timer: 20 * 1000
      });
   }

   ngOnDestroy(): void {
      this.subscription.unsubscribe();
   }

   createUser(): void {
      // this.newUser.sessionTimeOutMs = this.daysAndHoursToMS(this.newUser.sessionDays, this.newUser.sessionHours);
      // this.usersService.CreateUser(this.toUser(this.deepCopyUser(this.newUser)))
         // .then(() => {

         //    this.genericToast({
         //       type: 'success',
         //       title: `יצירת ${this.newUser.friendlyName} בוצעה בהצלחה`
         //    });
         //    this.newUser = undefined;
         // })
         // .catch((err: HttpErrorResponse) => {
         //    this.handelErrorResponse(err);

         // });
   }

   // async deleteUser(user: UserView): Promise<void> {
   //    let cancelDelete = false;

   //    await swal({
   //       title: 'בטוח למחוק?',
   //       text: `המשתמש ${user.friendlyName} לא יוכל לגשת יותר למידע ויימחק לצמיתות`,
   //       showConfirmButton: true,
   //       type: 'warning',
   //       showCancelButton: true,
   //       confirmButtonText: 'מחק בכל זאת',
   //       cancelButtonText: 'ביטול',
   //    })
   //       .then((result: SweetAlertResult) => {

   //          if (result.dismiss) {
   //             cancelDelete = true;
   //             return;
   //          }
   //       });

   //    if (cancelDelete) {
   //       return;
   //    }

   //    await this.usersService.DeleteUser(user)
   //       .then(() => {
   //          this.genericToast({
   //             type: 'success',
   //             title: `מחיקת ${user.friendlyName} בוצעה בהצלחה`
   //          });
   //       })
   //       .catch((err: HttpErrorResponse) => {
   //          this.handelErrorResponse(err);
   //       });
   // }

   // updateUser(): void {
   //    this.selectedUser.sessionTimeOutMs = this.daysAndHoursToMS(this.selectedUser.sessionDays, this.selectedUser.sessionHours);
   //    const userCopy = this.deepCopyUser(this.selectedUser);
   //    this.usersService.EditUser(this.toUser(userCopy))
   //       .then(() => {
   //          this.genericToast({
   //             type: 'success',
   //             title: `עדכון ${this.selectedUser.friendlyName} בוצע בהצלחה`
   //          });
   //          this.selectedUser = undefined;
   //       })
   //       .catch((err: HttpErrorResponse) => {
   //          this.handelErrorResponse(err);
   //       });
   // }

   // deepCopyUser(user: UserView): UserView {
   //    return JSON.parse((JSON.stringify(user))) as UserView;
   // }
   // getFilterdUsers(filterBy: string): UserView[] {
   //    const filterdUsers: UserView[] = [];

   //    for (const user of this.users) {
   //       if (!filterBy || JSON.stringify(user).indexOf(filterBy) !== -1) {
   //          filterdUsers.push(user);
   //       }
   //    }

   //    return filterdUsers;
   // }
}
