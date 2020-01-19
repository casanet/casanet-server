import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as cryptoJs from 'crypto-js';
import { SessionsBl } from '../../../src/business-layer/sessionsBl';
import { Configuration } from '../../../src/config';
import { SessionsDal } from '../../../src/data-layer/sessionsDal';
import { Session } from '../../../src/models/backendInterfaces';
import { ErrorResponse, User } from '../../../src/models/sharedInterfaces';
import { SessionsDalMock } from '../data-layer/sessionsDal.mock.spec';

const sessionDalMock = new SessionsDalMock();
const SessionBlMock = new SessionsBl((sessionDalMock as unknown) as SessionsDal);

describe('Session BL tests', () => {
  describe('Get Session', () => {
    it('it should get session successfully', async () => {
      const key = '543583bfngfnds45453535256524';
      sessionDalMock.mockSessions[2].keyHash = cryptoJs.SHA512(key + Configuration.keysHandling.saltHash).toString();
      const session = await SessionBlMock.getSession(key);

      expect(session).to.deep.equal(sessionDalMock.mockSessions[2]);
      return;
    });

    it('it should get nothing for empty session', async () => {
      try {
        await SessionBlMock.getSession('');
      } catch (error) {
        return;
      }

      throw new Error('get empty session should fail');
    });

    it('it should get nothing for undefined session', async () => {
      try {
        await SessionBlMock.getSession(undefined);
      } catch (error) {
        return;
      }

      throw new Error('get undefined session should fail');
    });
  });

  describe('Get User Sessions', () => {
    it('it should get sessions successfully', async () => {
      const userToGetFor: User = {
        email: sessionDalMock.mockSessions[0].email,
        displayName: '',
        ignoreTfa: true,
        password: 'ffd',
        scope: 'userAuth',
      };
      const sessions = await SessionBlMock.getUserSessions(userToGetFor);

      expect(sessions).to.be.a('array');
      expect(sessions)
        .to.be.an('array')
        .that.is.length(2);
      return;
    });
  });

  describe('Generate Session', () => {
    it('it should create session successfully', async () => {
      const session = await SessionBlMock.generateSession({
        email: sessionDalMock.mockSessions[2].email,
        displayName: '',
        ignoreTfa: true,
        password: 'ffd',
        scope: 'userAuth',
      });

      expect(session)
        .to.be.a('string')
        .length.above(60);
      expect(sessionDalMock.mockSessions).length(5);
      return;
    });
  });

  describe('Delete Session', () => {
    it('it should delete session successfully', async () => {
      await SessionBlMock.deleteSession(sessionDalMock.mockSessions[2]);

      expect(sessionDalMock.mockSessions).length(4);
      return;
    });
  });
});
