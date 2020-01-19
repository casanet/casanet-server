import { User } from '../../../src/models/sharedInterfaces';

export class UsersDalMock {
  public mockUsers: User[] = [
    {
      email: 'aa@bb.com',
      displayName: 'firstName1',
      ignoreTfa: true,
      password: '1234',
      scope: 'userAuth',
    },
    {
      email: 'aa@bbb.com',
      displayName: 'firstName2',
      ignoreTfa: true,
      password: 'password',
      scope: 'userAuth',
    },
    {
      email: 'aaa@bb.com',
      displayName: 'firstName3',
      ignoreTfa: false,
      password: 'password',
      scope: 'userAuth',
    },
    {
      email: 'aaa@bbb.com',
      displayName: 'firstName4',
      ignoreTfa: true,
      password: '1234321',
      scope: 'userAuth',
    },
  ];

  public async getUsers(): Promise<User[]> {
    return this.mockUsers;
  }

  public async getUser(email: string): Promise<User> {
    for (const user of this.mockUsers) {
      if (user.email === email) {
        return user;
      }
    }
    throw new Error('user not exist');
  }

  public async createUser(newUser: User): Promise<void> {
    this.mockUsers.push(newUser);
  }

  public async deleteUser(user: User): Promise<void> {
    this.mockUsers.splice(this.mockUsers.indexOf(user), 1);
  }
}
