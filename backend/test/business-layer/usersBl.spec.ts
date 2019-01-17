import * as chai from 'chai';
import { assert, expect } from 'chai';
import { UsersBl } from '../../src/business-layer/usersBl';
import { UsersDal } from '../../src/data-layer/usersDal';
import { ErrorResponse, User } from '../../src/models/sharedInterfaces';
import * as cryptoJs from 'crypto-js';

class UsersDalMock {

    public mockUsers: User[] = [
        {
            email: 'aa@bb.com',
            displayName: 'firstName1',
            ignoreTfa: true,
            password: '1234',
            sessionTimeOutMS: 123454321,
            scope: 'userAuth',
        },
        {
            email: 'aa@bbb.com',
            displayName: 'firstName2',
            ignoreTfa: true,
            password: 'password',
            sessionTimeOutMS: 765432,
            scope: 'adminAuth',
        },
        {
            email: 'aaa@bb.com',
            displayName: 'firstName3',
            ignoreTfa: false,
            password: 'password',
            sessionTimeOutMS: 845646,
            scope: 'userAuth',
        },
        {
            email: 'aaa@bbb.com',
            displayName: 'firstName4',
            ignoreTfa: true,
            password: '1234321',
            sessionTimeOutMS: 123454321,
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
        email: '12345cm@vf.com',
        displayName: 'fnl',
        ignoreTfa: false,
        password: '123456789',
        sessionTimeOutMS: 5359436,
        scope: 'userAuth',
    };

    describe('Create new user', () => {
        it('it should fail to create user', async () => {

            try {
                await usersBl.createUser(additionalUser);
            } catch (error) {
                const expectedError: ErrorResponse = {
                    responseCode: 4022,
                };
                expect(error).to.have.property('responseCode').to.deep.equal(4022);
                return;
            };

            throw new Error('new user created while password less then 10 chars');
        });

        it('it should create user succsessfully', async () => {

            additionalUser.password = '1234567890';
            await usersBl.createUser(additionalUser);

            const user = await usersBl.getUser(additionalUser.email);

            additionalUser.password = cryptoJs.SHA256(additionalUser.password).toString();
            expect(user).to.deep.equal(additionalUser);
            return;
        });
    });

    describe('Delete User', () => {
        it('it should delete user succsessfully', async () => {


            await usersBl.deleteUser(additionalUser.email);

            expect(usersDalMock.mockUsers).length(4);
            return;
        });
    });

    describe('Update User', () => {

        it('it should fail update request', async () => {
            // cant updat unknow user.
        });

    });
});
