import { getConnection } from 'typeorm';

import { LocalServer } from '../models';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';

export const getServers = async (): Promise<LocalServer[]> => {
  const serversRepository = getConnection().getRepository(LocalServer);
  return await serversRepository.find();
};

export const getServer = async (macAddress: string): Promise<LocalServer> => {
  const serversRepository = getConnection().getRepository(LocalServer);
  return await serversRepository.findOne({
    where: {
      macAddress
    }
  });
};

export const getServersByUser = async (user: string): Promise<LocalServer[]> => {
  const serversRepository = getConnection().getRepository(LocalServer);
  return await serversRepository.find({
    where: {
      validUsers: {
        value: user,
      }
    }
  });
};

export const updateServer = async (server: LocalServer): Promise<void> => {
  const { displayName, validUsers, macAddress } = server;
  const serversRepository = getConnection().getRepository(LocalServer);
  await serversRepository.update(macAddress, {
    displayName,
    validUsers,
  });
};

export const createServer = async (server: LocalServer): Promise<void> => {
  if (await getServer(server.macAddress)) {
    throw {
      responseCode: 5001,
      message: 'local server with given mac address already exsit',
    } as ErrorResponse;
  }

  const serversRepository = getConnection().getRepository(LocalServer);
  await serversRepository.save(new LocalServer(server));
};

export const deleteServer = async (macAddress: string): Promise<void> => {
  const serversRepository = getConnection().getRepository(LocalServer);
  await serversRepository.delete(macAddress);
};
