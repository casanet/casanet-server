import { Injectable } from '@angular/core';
import { Observable, Subscriber, BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { User } from '../../../../backend/src/models/sharedInterfaces';
import { ToasterAndErrorsService } from './toaster-and-errors.service';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class UsersService {

  private isUsersRetrived = false;
  private userProfile: User;

  public users: User[] = [];
  public usersFeed: BehaviorSubject<User[]> = new BehaviorSubject<User[]>(this.users);


  constructor(
    private toastrAndErrorsService: ToasterAndErrorsService,
    private authService: AuthService,
    private httpClient: HttpClient) {

    this.userProfile = this.authService.userProfile.value;
    this.authService.userProfile.subscribe((userProfile) => {
      if (!userProfile || userProfile.scope !== 'adminAuth') {
        return;
      }
      this.retriveData();
    });
  }

  private async loadUsers() {
    try {
      this.users = await this.httpClient.get<User[]>('/API/users').toPromise();
      this.usersFeed.next(this.users);
    } catch (error) {
      this.isUsersRetrived = false;

      if (error.status === 403 || error.status === 401) {
        return;
      }
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  private async retriveUsers() {
    if (!this.isUsersRetrived) {
      this.isUsersRetrived = true;
      await this.loadUsers();
    }
  }

  public async createUser(user: User) {
    try {
      await this.httpClient.post('/API/users', user).toPromise();
      this.loadUsers();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async deleteUser(user: User) {
    try {
      await this.httpClient.delete(`/API/users/${user.email}`).toPromise();
      this.loadUsers();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async editUser(user: User) {
    try {
      await this.httpClient.put(`/API/users/${user.email}`, user).toPromise();
      this.loadUsers();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async deactivateUserSessions(user: User) {
    try {
      await this.httpClient.post(`/API/auth/logout-sessions/${user.email}`, {}).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async refreshData() {
    await this.loadUsers();
  }

  public async cleanUp() {
    this.isUsersRetrived = false;
    this.users = [];
  }

  public async retriveData() {
    if (this.userProfile.scope === 'adminAuth') {
      this.retriveUsers();
    }
  }

  public async requestRegistrationCode(user: User) {
    try {
      await this.httpClient.post(`/API/users/forward-auth/${user.email}`, {}).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async removeUserFromRemote(user: User) {
    try {
      await this.httpClient.delete(`/API/users/forward/${user.email}`, {}).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async requestRegiterUser(user: User, code: string) {
    try {
      await this.httpClient.post(`/API/users/forward/${user.email}`, { code : code }).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }
}
