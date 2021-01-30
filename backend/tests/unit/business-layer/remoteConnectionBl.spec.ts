import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as moment from 'moment';
import { MinionsBl } from '../../../src/business-layer/minionsBl';
import { RemoteConnectionBl } from '../../../src/business-layer/remoteConnectionBl';
import { TimingsBl } from '../../../src/business-layer/timingsBl';
import { UsersBl } from '../../../src/business-layer/usersBl';
import { RemoteConnectionDal } from '../../../src/data-layer/remoteConnectionDal';
import { UsersDal } from '../../../src/data-layer/usersDal';
import { Delay } from '../../../src/utilities/sleep';
import { MinionsBlMock } from '../business-layer/minionsBl.mock.spec';
import { RemoteConnectionDalMock } from '../data-layer/remoteConnectionDal.mock.spec';
import { UsersDalMock } from '../data-layer/usersDal.mock.spec';
// import { WebSocketMockSinglton } from './remoteConnection.mock.spec';
import { TimingsBlMock } from './timingsBl.mock.spec';

const minionBlMock = new MinionsBlMock();

const usersBlMock = new UsersBl((new UsersDalMock() as unknown) as UsersDal);

const remoteConnectionBl = new RemoteConnectionBl(
  (new RemoteConnectionDalMock() as unknown) as RemoteConnectionDal,
  (minionBlMock as unknown) as MinionsBl,
  (new TimingsBlMock() as unknown) as TimingsBl,
);
remoteConnectionBl.initRemoteConnectionModule();

// remoteConnectionBl.setRemoteSettings({
//     host: '127.0.0.1:4112',
//     connectionKey: 'mock',
// });
