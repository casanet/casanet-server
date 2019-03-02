import { Injectable } from '@angular/core';
import { Observable, Subscriber, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class UsersService {

  // private usersTracker = new BehaviorSubject<User[]>([]);

  // private users: User[] = [];

  // constructor(private httpClient: HttpClient) {
  //   this.httpClient.get(`/users`).toPromise().then((data: User[]) => {
  //     this.users = data;
  //     this.usersTracker.next(data);
  //   }).catch((err => {
  //     this.users = [];
  //     this.usersTracker.next([]);
  //   }).bind(this));
  // }

  // private getUserByEmail(email: string): User {
  //   for (const user of this.users) {
  //     if (user.email === email) {
  //       return user;
  //     }
  //   }
  // }

  // public GetUsers(): Observable<User[]> {
  //   return this.usersTracker.asObservable();
  // }

  // public CreateUser(user: User): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.httpClient.post(`/users`, user).toPromise().then(() => {
  //       this.users.push(user);
  //       this.usersTracker.next(this.users);
  //       resolve();
  //     }).catch(reject);
  //   });
  // }

  // public EditUser(user: User): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.httpClient.put(`/users/${user.email}`, user).toPromise().then(() => {
  //       this.users.splice(this.users.indexOf(this.getUserByEmail(user.email)), 1);
  //       this.users.push(user);
  //       this.usersTracker.next(this.users);
  //       resolve();
  //     }).catch(reject);
  //   });
  // }

  // public DeleteUser(user: User): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.httpClient.delete(`/users/${user.email}`).toPromise().then(() => {
  //       this.users.splice(this.users.indexOf(this.getUserByEmail(user.email)), 1);
  //       this.usersTracker.next(this.users);
  //       resolve();
  //     }).catch(reject);
  //   });
  // }
}
