import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subscriber, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly USER_INFO_NAME: string = 'user';
  private userInfoObservers: Subscriber<{}>[] = [];
  // public defaultUser: User = {
  //   email: 'unknown@unknown.com',
  //   friendlyName: 'לא מחובר',
  //   access: 'non',
  //   maxSessions: 0,
  //   sessionTimeOutMs: 0
  // };
  // public userInfo: User = this.defaultUser;

  constructor(private httpClient: HttpClient, private router: Router) {
    this.loadUserInfo();
  }

  public userInfoObserveable = new Observable(((o: Subscriber<{}>) => {
    this.loadUserInfo();
    this.userInfoObservers.push(o);
    // o.next(this.userInfo);
  }).bind(this));

  private loadUserInfo(): void {
    const userdata = this.getDataStorage(this.USER_INFO_NAME);

    if (userdata && userdata.access !== 'non') {
      // this.userInfo = userdata;
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
      return false;
    }
  }

  private activeLogin(user): void { // User): void {

    this.setDataStorage(this.USER_INFO_NAME, user);

    // this.userInfo = user;
    // for (const userObserver of this.userInfoObservers) {
    //   userObserver.next(this.userInfo);
    // }
  }

  /**
   * Try login.
   * @param email email to login with
   * @param password password to login req.
   * @returns A promise, with bool to mark if need more action to login.
   * when need to use 2FA api.
   * so true if need to continue with login progress.
   */
  public login(email: string, password: string): Promise<boolean> {

    return new Promise((resolve, reject) => {

      // this.httpClient.post<User>('/login', { email: email, password: password }, { observe: 'response' }).toPromise()
      //   .then(((httpRes: HttpResponse<User>) => {

      //     if (httpRes.status === 200) {
      //       this.activeLogin(httpRes.body);
      //       resolve(false);
      //     } else {
      //       resolve(true);
      //     }

      //   }).bind(this))
      //   .catch(reject);
    });
  }

  public async loginTfa(email: string, password: string): Promise<void> {

    // await this.httpClient.post<User>('/login/tfa', { email: email, password: password }).toPromise()
    //   .then(((user: User) => {
    //     this.activeLogin(user);
    //   }).bind(this))
    //   .catch((httpRes) => {
    //     throw httpRes;
    //   });
  }

  public logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpClient.post('/logout', {}).toPromise()
        .then((() => {

          // this.setDataStorage(this.USER_INFO_NAME, this.defaultUser);
          // this.userInfo = this.defaultUser;
          this.router.navigate(['/login']);
          resolve();
        }).bind(this))
        .catch(reject);
    });
  }
}
