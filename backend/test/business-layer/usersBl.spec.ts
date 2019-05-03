import * as bcrypt from 'bcryptjs';
import * as chai from 'chai';
import { assert, expect } from 'chai';
import { UsersBl } from '../../src/business-layer/usersBl';
import { UsersDal } from '../../src/data-layer/usersDal';
import { ErrorResponse, User } from '../../src/models/sharedInterfaces';
import { UsersDalMock } from '../data-layer/usersDal.mock.spec';

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
        password: '123',
        sessionTimeOutMS: 5359436,
        scope: 'userAuth',
    };

    describe('Create new user', () => {
        it('it should fail to create user', async () => {

            try {
                await usersBl.createUser(additionalUser);
            } catch (error) {
                const expectedError: ErrorResponse = {
                    responseCode: 2422,
                };
                expect(error).to.have.property('responseCode').to.deep.equal(2422);
                return;
            }

            throw new Error('new user created while password less then 6 chars');
        });

        it('it should create user succsessfully', async () => {

            additionalUser.password = '1234567890';
            await usersBl.createUser(additionalUser);

            const user = await usersBl.getUser(additionalUser.email);

            /** Make sure tha password hashed */
            if (!bcrypt.compareSync(additionalUser.password, user.password)) {
                throw new Error('Passowrd not hashed correctly');
            }

            /** For test other user properties math only */
            user.password = additionalUser.password;

            expect(user).to.deep.equal(additionalUser);
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
