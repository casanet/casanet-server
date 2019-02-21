import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { BehaviorSubject, from, Observable, Subscriber } from 'rxjs';
import { DevicesBl } from '../../src/business-layer/devicesBl';
import { TimeoutBl } from '../../src/business-layer/timeoutBl';
import { DeviceKind, ErrorResponse, LocalNetworkDevice, Minion, MinionStatus, TimingFeed, User } from '../../src/models/sharedInterfaces';

export class TimingsBlMock {
    /*
    * Timing trigger feed.
    */
    public timingFeed = new BehaviorSubject<TimingFeed>(undefined);
}
