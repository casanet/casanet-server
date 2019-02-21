import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { BehaviorSubject, from, Observable, Subscriber } from 'rxjs';
import { DevicesBl } from '../../src/business-layer/devicesBl';
import { MinionsBl } from '../../src/business-layer/minionsBl';
import { TimeoutBl } from '../../src/business-layer/timeoutBl';
import { DeviceKind, ErrorResponse, LocalNetworkDevice, Minion, MinionStatus, User } from '../../src/models/sharedInterfaces';
import { MinionsBlMock } from './minionsBl.mock.spec';

const minionsBlMock = new MinionsBlMock();
const timeoutBlMock = new TimeoutBl(minionsBlMock as unknown as MinionsBl);

describe('Timeout BL tests', () => {
    describe('Handle new minion', () => {
        it('it should get handle the minion succsessfully', (done) => {
            /**
             * The error is *not* in stackstrace to here so the error is destroyed
             * specs lib UI.
             */
            try {
                minionsBlMock.minionFeed.next({
                    event: 'created',
                    minion: {
                        device: {
                            brand: 'a',
                            model: 'b',
                            pysicalDevice: {
                                mac: 'm',
                            },
                        },
                        minionId: 'mi',
                        minionType: 'switch',
                        name: 'm1',
                        minionStatus: {

                        },
                    },
                });
            } catch (error) {
                throw new Error('fail to create new minoin without status');
            }

            done();
        });
    });
});
