import * as chai from 'chai';
import { assert, expect } from 'chai';
import { UsersBl } from '../../src/business-layer/usersBl';
import { UsersDal } from '../../src/data-layer/usersDal';
import { ErrorResponse, User } from '../../src/models/sharedInterfaces';

class UsersDalMock {

    public mockUsers: User[] = [
        {
            email: 'aa@bb.com',
            firstName: 'firstName1',
            ignoreTfa: true,
            password: '1234',
            sessionTimeOutMS: 123454321,
        },
        {
            email: 'aa@bbb.com',
            firstName: 'firstName2',
            ignoreTfa: true,
            password: 'password',
            sessionTimeOutMS: 765432,
        },
        {
            email: 'aaa@bb.com',
            firstName: 'firstName3',
            ignoreTfa: false,
            password: 'password',
            sessionTimeOutMS: 845646,
        },
        {
            email: 'aaa@bbb.com',
            firstName: 'firstName4',
            ignoreTfa: true,
            password: '1234321',
            sessionTimeOutMS: 123454321,
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
    }

    public async createUser(newUser: User): Promise<void> {
        this.mockUsers.push(newUser);
    }

    public async deleteUser(user: User): Promise<void> {
        this.mockUsers.splice(this.mockUsers.indexOf(user), 1);
    }
}

const usersDalMock = new UsersDalMock();
const usersBl = new UsersBl(usersDalMock as unknown as UsersDal);

describe('Users BL tests', () => {

    describe('Get User by email', () => {
        it('it should get user succsessfully', async () => {

            const user = await usersBl.getUser(usersDalMock.mockUsers[2].email);

            expect(user).to.deep.equal(usersDalMock.mockUsers[2]);
            return;
        });
    });

    describe('Get All Users', () => {
        it('it should get Users succsessfully', async () => {

            const users = await usersBl.getUsers();

            expect(users).to.deep.equal(usersDalMock.mockUsers);
            return;
        });
    });

    const additionalUser: User = {
        email: '12.cm@vf.com',
        firstName: 'fnl',
        ignoreTfa: false,
        password: 'uybj76564',
        sessionTimeOutMS: 5359436,
    };

    describe('Create new user', () => {
        it('it should create user succsessfully', async () => {

            await usersBl.createUser(additionalUser);

            const user = await usersBl.getUser(additionalUser.email);
            expect(user).to.deep.equal(additionalUser);
            return;
        });
    });

    describe('Delete User', () => {
        it('it should delete user succsessfully', async () => {

            await usersBl.deleteUser(additionalUser);

            expect(usersDalMock.mockUsers).length(4);
            return;
        });
    });
});
