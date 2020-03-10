import * as express from 'express';
import { Application, NextFunction, Request, Response } from 'express';
import { sessionExpiresMs } from '../business-layer/authBl';
import { SessionsBlSingleton } from '../business-layer/sessionsBl';
import { UsersBlSingleton } from '../business-layer/usersBl';
import { IftttIntergrationDalSingleton } from '../data-layer/iftttIntegrationDal';
import { Session } from '../models/backendInterfaces';
import {
  AuthScopes,
  ErrorResponse,
  IftttActionTriggeredRequest,
  IftttIntegrationSettings,
  User,
} from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

/**
 * System auth scopes, shown in swagger doc as 2 kinds of security definitions.
 */
export const SystemAuthScopes: {
  adminScope: AuthScopes;
  userScope: AuthScopes;
  iftttScope: AuthScopes;
} = {
  adminScope: 'adminAuth',
  userScope: 'userAuth',
  iftttScope: 'iftttAuth',
};

/**
 * Cert Authentication middelwhere API.
 * the auth token should be the value of 'session' cookie.
 * @param securityName Used as auth scope beacuse of poor scopes swaggger support in apiKey auth.
 */
export const expressAuthentication = async (
  request: express.Request,
  scopes: string[],
): Promise<User | ErrorResponse> => {
  // If the routing security sent wrong security scope.
  if (!scopes || scopes.length < 1) {
    logger.error('invalid or empty security scope');
    throw {
      responseCode: 1501,
    } as ErrorResponse;
  }

  if (scopes.indexOf(SystemAuthScopes.iftttScope) !== -1) {
    const authedRequest: IftttActionTriggeredRequest = request.body;
    if (typeof authedRequest === 'object' && authedRequest.apiKey) {
      const iftttIntegrationSettings: IftttIntegrationSettings = await IftttIntergrationDalSingleton.getIntegrationSettings();
      if (iftttIntegrationSettings.enableIntegration && authedRequest.apiKey === iftttIntegrationSettings.apiKey) {
        return;
      }
    }

    throw {
      responseCode: 1401,
    } as ErrorResponse;
  }

  // If the session cookie empty, ther is nothing to check.
  if (!request.cookies.session) {
    throw {
      responseCode: 1401,
    } as ErrorResponse;
  }

  try {
    const session = await SessionsBlSingleton.getSession(request.cookies.session);
    const user = await UsersBlSingleton.getUser(session.email);

    /**
     * Make sure that session not expired.
     */
    if (new Date().getTime() - session.timeStamp > sessionExpiresMs) {
      await SessionsBlSingleton.deleteSession(session);
      throw {
        responseCode: 1403,
      } as ErrorResponse;
    }

    /**
     * Pass only in user scope in requierd scopes and the scope is valid.
     */
    if (scopes.indexOf(user.scope) !== -1 && Object.values(SystemAuthScopes).indexOf(user.scope) !== -1) {
      return user;
    }

    logger.info(`user ${user.email} try to access ${request.method} ${request.path} above his scope ${user.scope}`);
    throw {
      responseCode: 1403,
    } as ErrorResponse;
  } catch (error) {
    throw {
      responseCode: 1403,
    } as ErrorResponse;
  }
};
