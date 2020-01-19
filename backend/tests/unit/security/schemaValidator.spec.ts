import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as express from 'express';
import { ErrorResponse, Login, RemoteSettings } from '../../../src/models/sharedInterfaces';
import {
  ErrorResponseSchema,
  LoginSchema,
  RemoteSettingsSchema,
  RequestSchemaValidator,
  SchemaValidator,
} from '../../../src/security/schemaValidator';

describe('Schema validator tests', () => {
  describe('Test login schema', () => {
    it('it should pass succsessfully', async () => {
      const login: Login = {
        email: 'aa@bb.com',
        password: '123456',
      };
      const fakeRequest = {
        body: login,
      };
      const filterdLogin = await RequestSchemaValidator(fakeRequest as express.Request, LoginSchema).catch(() => {
        throw new Error('auth fail');
      });

      expect(filterdLogin).to.deep.equal({
        email: 'aa@bb.com',
        password: '123456',
      });
      return;
    });

    it('it should fail', async () => {
      const login: Login = {
        email: 'aa@bb.com',
        password: '123456',
      };
      delete login['email'];
      const fakeRequest = {
        body: login,
      };
      let validationFail = true;
      await RequestSchemaValidator(fakeRequest as express.Request, LoginSchema)
        .then(() => {
          validationFail = false;
        })
        .catch(err => {});

      if (!validationFail) {
        throw new Error('valiation shuold fail');
      }

      return;
    });
  });

  describe('Test RemoteSettingsSchema schema', () => {
    it('it should pass ws succsessfully', async () => {
      const remoteSettings: RemoteSettings = {
        host: 'ws://127.0.0.1',
        connectionKey: '123456',
      };
      const filterdRemoteSettings = await SchemaValidator(remoteSettings, RemoteSettingsSchema).catch(() => {
        throw new Error('valid ws RemoteSettingsSchema schema fail');
      });

      expect(filterdRemoteSettings).to.deep.equal(remoteSettings);
    });

    it('it should pass wss succsessfully', async () => {
      const remoteSettings: RemoteSettings = {
        host: 'wss://localhost:8080',
        connectionKey: '123456',
      };
      const filterdRemoteSettings = await SchemaValidator(remoteSettings, RemoteSettingsSchema).catch(() => {
        throw new Error('valid wss RemoteSettingsSchema schema fail');
      });

      expect(filterdRemoteSettings).to.deep.equal(remoteSettings);
    });

    it('it should fail other protocol URI', async () => {
      const remoteSettings: RemoteSettings = {
        host: 'http://127.0.0.1',
        connectionKey: '123456',
      };

      try {
        await await SchemaValidator(remoteSettings, RemoteSettingsSchema);
      } catch (error) {
        return;
      }

      throw new Error('invalid RemoteSettings URI schema passed validator');
    });

    it('it should fail without protocol URI', async () => {
      const remoteSettings: RemoteSettings = {
        host: '127.0.0.1:8080',
        connectionKey: '123456',
      };

      try {
        await await SchemaValidator(remoteSettings, RemoteSettingsSchema);
      } catch (error) {
        return;
      }

      throw new Error('invalid RemoteSettings URI schema passed validator');
    });
  });

  describe('Test error response schema', () => {
    it('it should pass succsessfully', async () => {
      const error: ErrorResponse = {
        responseCode: 5043,
      };
      const filterdError = await SchemaValidator(error, ErrorResponseSchema).catch(() => {
        throw new Error('valid error response schema fail');
      });

      expect(filterdError).to.deep.equal(error);
      return;
    });

    it('it should fail', async () => {
      const error = {
        message: '5043',
      };

      try {
        await SchemaValidator(error, ErrorResponseSchema);
      } catch (error) {
        return;
      }

      throw new Error('invalid schema passed validator');
    });
  });
});
