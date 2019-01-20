import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subscriber, Subscription } from 'rxjs';
import { Minion } from '../../../src/models/sharedInterfaces';
import { MockHandler } from '../../../src/modules/mock/mockHandler';

const mockHandler = new MockHandler();
mockHandler.retrieveMinions.setPullMethod(async (): Promise<Minion[]> => {
    return [];
});

describe('Mock handler tests', () => {

    it('it should get pysical updates', (done) => {
        // TODO:
        // const subscription: Subscription = mockHandler.minionStatusChangedEvent.subscribe((update) => {
        //     if (update && update.minionId === '656565656') {
        //         subscription.unsubscribe();
        //         done();
        //     }
        // });
        done();
    }).timeout(moment.duration(10, 'seconds').asMilliseconds());
});
