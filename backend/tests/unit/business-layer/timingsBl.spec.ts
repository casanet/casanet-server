import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { OperationsBl } from '../../../src/business-layer/operationsBl';
import { TimingsBl } from '../../../src/business-layer/timingsBl';
import { TimingsDal } from '../../../src/data-layer/timingsDal';
import { DeviceKind, ErrorResponse, LocalNetworkDevice, Minion, Timing } from '../../../src/models/sharedInterfaces';
import { Delay } from '../../../src/utilities/sleep';
import { TimingsDalMock } from '../data-layer/timingsDal.mock.spec';

const timingsDalMock = new TimingsDalMock();
const timingsBl = new TimingsBl((timingsDalMock as unknown) as TimingsDal, {} as OperationsBl);

describe('Timings BL tests', () => {});
