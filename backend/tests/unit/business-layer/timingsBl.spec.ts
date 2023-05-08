import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { OperationsBl } from '../../../src/business-layer/operationsBl';
import { TimingsBl } from '../../../src/business-layer/timingsBl';
import { TimingsDal } from '../../../src/data-layer/timingsDal';
import { DeviceKind, ErrorResponse, LocalNetworkDevice, Minion, Timing } from '../../../src/models/sharedInterfaces';
import { Delay } from '../../../src/utilities/sleep';
import { TimingsDalMock } from '../data-layer/timingsDal.mock.spec';
import { MinionsBlMock } from './minionsBl.mock.spec';

const timingsDalMock = new TimingsDalMock();
const minionsBlMock = new MinionsBlMock();

const timingsBl = new TimingsBl((timingsDalMock as unknown) as TimingsDal, {} as OperationsBl, minionsBlMock as any);
timingsBl.initTimingModule();

describe('Timings BL tests', () => {});
