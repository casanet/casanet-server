import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subscriber, Subscription } from 'rxjs';
import { MockHandler } from './mockHandler';

const mockHandler = new MockHandler();

describe('Mock handler tests', () => {

    it('it should get pysical updates', (done) => {
        let switchArrived = false;
        let acArrived = false;
        const subscription: Subscription = mockHandler.minionStatusChangedEvent.subscribe((update) => {
            if (update.mac === '4343434343') {

                switchArrived = true;
            } else if (update.mac === '656565656') {

                acArrived = true;
            }

            if (acArrived && switchArrived) {
                subscription.unsubscribe();
                done();
            }
        });
    }).timeout(moment.duration(20, 'seconds').asMilliseconds());
});
