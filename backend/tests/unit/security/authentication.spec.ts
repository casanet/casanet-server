import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as express from 'express';
import { validSession, validSystemAdmin, validSystemUser } from '../../e2e/prepareRoutesSpecTests.spec';
import { ErrorResponse, User } from '../../../src/models/sharedInterfaces';
import { expressAuthentication, SystemAuthScopes } from '../../../src/security/authentication';

describe('Security scopes validation middelwere', () => {
  describe('Test certification', () => {
    it('it should pass successfully', async () => {
      const faksRequest = {
        cookies: {
          session: validSession.userSessionKey,
        },
				headers: {},
      };
      const user = (await expressAuthentication(faksRequest as express.Request, SystemAuthScopes.userScope).catch(
        () => {
          throw new Error('auth fail');
        },
      )) as User;

      // Password hash not same even if plain text is the same.
      user.password = validSystemUser.password;
      expect(user).to.deep.equal(validSystemUser);
      return;
    });

    it('it should denied', async () => {
      const faksRequest = {
        cookies: {
          session: 'abc1234567',
        },
				headers: {},
      };
      expressAuthentication(faksRequest as express.Request, SystemAuthScopes.userScope)
        .then(() => {
          throw new Error('Access should denied, but bad cert passed');
        })
        .catch((err: ErrorResponse | Error) => {
          const expectedError: ErrorResponse = {
            responseCode: 1403,
          };
          expect(err).to.deep.equal(expectedError);
        });
    });

    it('it should denied', async () => {
      const faksRequest = {
        cookies: {},
				headers: {},
      };
      expressAuthentication(faksRequest as express.Request, SystemAuthScopes.userScope)
        .then(() => {
          throw new Error('Access should denied, but empty cert passed');
        })
        .catch((err: ErrorResponse) => {
          const expectedError: ErrorResponse = {
            responseCode: 1401,
          };
          expect(err).to.deep.equal(expectedError);
        });
    });

    it('it should denied', async () => {
      // TODO : session expierd
    });
  });

  describe('Test Auth Scopes', () => {
    it('it should pass as admin scope', async () => {
      const faksRequest = {
        cookies: {
          session: validSession.adminSessionKey,
        },
				headers: {},
      };
      const user = (await expressAuthentication(faksRequest as express.Request, SystemAuthScopes.adminScope).catch(
        () => {
          throw new Error('admin scope auth fail');
        },
      )) as User;

      // Password hash not same even if plain text is the same.
      user.password = validSystemAdmin.password;
      expect(user).to.deep.equal(validSystemAdmin);
      return;
    });

    it('it should denied any access', async () => {
      const faksRequest = {
        cookies: {
          session: validSession.userSessionKey,
        },
				headers: {},
      };
      try {
        await expressAuthentication(faksRequest as express.Request, 'testScop');
      } catch (err) {
        const expectedError: ErrorResponse = {
          responseCode: 1403,
        };
        expect(err).to.deep.equal(expectedError);
        return;
      }
      throw new Error('Access should throw unknown scope exception, but bad scope passed');
    });

    it('it should denied any access', async () => {
      const faksRequest = {
        cookies: {
          session: validSession.userSessionKey,
        },
				headers: {},
      };
      try {
        await expressAuthentication(faksRequest as express.Request, '');
      } catch (err) {
        const expectedError: ErrorResponse = {
          responseCode: 1503,
        };
        expect(err).to.deep.equal(expectedError);
        return;
      }
      throw new Error('Access should throw unknown scope exception, but empty scope passed');
    });
  });
});
