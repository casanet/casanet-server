import { expect } from 'chai';
import { User } from '../src/models/sharedInterfaces';
import { validAdminAgent } from './prepareRoutesSpecTests';

describe('Users routing API', () => {

    describe('/GET users', () => {
        it('it should respond 20x as status code', (done) => {
            validAdminAgent.get('/API/users')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/GET users/{userId}', () => {
        it('it should respond 20x as status code', (done) => {
            validAdminAgent.get('/API/users/userId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/POST users', () => {
        it('it should respond 20x as status code', (done) => {
            const user: User = {
                firstName: '',
                ignoreTfa: false,
                email: 'aa@bb.com',
                password: '',
                sessionTimeOutMS: 334343232,
            };
            validAdminAgent.post('/API/users')
                .send(user)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/PUT users/{userId}', () => {
        it('it should respond 20x as status code', (done) => {
            const user: User = {
                firstName: '',
                ignoreTfa: false,
                email: 'aa@bb.com',
                password: '',
                sessionTimeOutMS: 334343232,
            };
            validAdminAgent.put('/API/users/userId')
                .send(user)
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });

    describe('/DELETE users/{userId}', () => {
        it('it should respond 20x as status code', (done) => {
            validAdminAgent.del('/API/users/userId')
                .end((err, res) => {
                    expect(res.statusType).eql(2);
                    done();
                });
        });
    });
});
