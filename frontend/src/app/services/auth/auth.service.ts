import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subscriber, Observer, BehaviorSubject } from 'rxjs';
import { User } from '../../../../../backend/src/models/sharedInterfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly USER_PROFILE_KEY_NAME: string = 'profile';

  private DEFAULT_USER: User = {
    email: 'unknown@unknown.com',
    displayName: 'unknown',
    scope: 'userAuth',
    ignoreTfa: false,
    sessionTimeOutMS: 10,
    password: '',
  };

  public userProfile: BehaviorSubject<User> = new BehaviorSubject<User>(this.DEFAULT_USER);

  constructor(private httpClient: HttpClient, private router: Router) {
    this.loadProfileCached();
  }

  private loadProfileCached(): void {
    const userdata: User = this.getDataStorage(this.USER_PROFILE_KEY_NAME) as User;

    if (userdata) {
      this.userProfile.next(userdata);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private setDataStorage(key: string, obj: any) {
    const values = JSON.stringify(obj);
    localStorage.setItem(key, values);
  }

  private getDataStorage(key: string) {
    if (localStorage.getItem(key) != null) {
      return JSON.parse(localStorage.getItem(key));
    } else {
      return;
    }
  }

  private setProfile(user: User): void {

    this.setDataStorage(this.USER_PROFILE_KEY_NAME, user);

    this.userProfile.next(user);
  }

  private async retriveProfile(): Promise<void> {
    const profile: User = await this.httpClient.get<User>('/API/users/profile').toPromise();
    this.setProfile(profile);
  }
  /**
   * Try login.
   * @param email email to login with
   * @param password password to login req.
   * @returns A promise, with bool to mark if need more action to login.
   * when need to use 2FA api.
   * so true if need to continue with login progress.
   */
  public async login(email: string, password: string): Promise<boolean> {
    const respone =
      await this.httpClient.post('/API/auth/login', { email: email, password: password }, { observe: 'response' }).toPromise();

    if (respone.status === 200) {
      await this.retriveProfile();
      return false;
    }

    return true;
  }

  public async loginTfa(email: string, password: string): Promise<void> {
    await this.httpClient.post('/API/auth/login/tfa', { email: email, password: password }).toPromise();
    await this.retriveProfile();
  }

  public async logout(): Promise<void> {
    await this.httpClient.post('/API/auth/logout', {}).toPromise();

    this.setProfile(this.DEFAULT_USER);
    this.router.navigate(['/login']);
  }
}
