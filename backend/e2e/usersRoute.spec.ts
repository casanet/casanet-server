import { expect } from 'chai';
import { User } from '../src/models/sharedInterfaces';
import { validAdminAgent, validUserAgent } from './prepareRoutesSpecTests.spec';

describe('Users routing API', () => {

    describe('/GET users/profile', () => {
        it('it should respond 20x as status code', (done) => {
            validAdminAgent.get('/API/users/profile')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/GET users', () => {
        it('it should respond 20x as status code', (done) => {
            validAdminAgent.get('/API/users')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });

        it('it should never let passwords in response', (done) => {
            validAdminAgent.get('/API/users')
                .end((err, res) => {
                    const users = res.body as User[];
                    for (const user of users) {
                        if (user.password) {
                            throw new Error('server should never let password get out. even it was hashed.');
                        }
                    }
                    done();
                });
        });

        it('it should respond 40x as status code', (done) => {
            validUserAgent.get('/API/users')
                .end((err, res) => {
                    expect(res.statusType).eql(4);
                    done();
                });
        });
    });

    describe('/GET users/{userId}', () => {
        it('it should respond 20x as status code', (done) => {
            validAdminAgent.get('/API/users/user@casa.net')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });

        it('it should never let password in response', (done) => {
            validAdminAgent.get('/API/users/user@casa.net')
                .end((err, res) => {
                    const user = res.body as User;
                    if (user.password) {
                        throw new Error('server should never let password get out. even it was hashed.');
                    }
                    done();
                });
        });

        it('it should respond 20x as status code', (done) => {
            validUserAgent.get('/API/users/user@casa.net')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });

        it('it should respond 50x as status code', (done) => {
            validUserAgent.get('/API/users/aa@bb.com')
                .end((err, res) => {
                    expect(res.statusType).eql(5);
                    done();
                });
        });
    });

    const newUser: User = {
        displayName: 'create by users API e2e',
        ignoreTfa: false,
        email: 'aa@bb.com',
        password: '1234567890',
        sessionTimeOutMS: 334343232,
        scope: 'userAuth',
    };

    describe('/POST users', () => {
        it('it should respond 40x as status code', (done) => {

            validUserAgent.post('/API/users')
                .send(newUser)
                .end((err, res) => {
                    expect(res.statusType).eql(4);
                    done();
                });
        });

        it('it should respond 20x as status code', (done) => {

            validAdminAgent.post('/API/users')
                .send(newUser)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });

        it('it should respond 50x as status code', (done) => {

            validAdminAgent.post('/API/users')
                .send(newUser)
                .end((err, res) => {
                    expect(res.statusType).eql(5);
                    done();
                });
        });

    });

    describe('/PUT users/{userId}', () => {
        it('it should respond 20x as status code', (done) => {

            newUser.displayName = 'update by admin';
            validAdminAgent.put(`/API/users/${newUser.email}`)
                .send(newUser)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });

        it('it should refused change user scope', (done) => {
            done();
        });
    });

    describe('/DELETE users/{userId}', () => {
        it('it should respond 20x as status code', (done) => {
            validAdminAgent.del(`/API/users/${newUser.email}`)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
