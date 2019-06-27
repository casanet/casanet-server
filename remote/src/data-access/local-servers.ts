import { getConnection, Any } from 'typeorm';

import { LocalServer } from '../models';
import { ErrorResponse } from '../../../backend/src/models/sharedInterfaces';
import { any } from 'joi';

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
  return await serversRepository
    .createQueryBuilder('server')
    .where(':user =ANY(server.valid_users)', { user })
    .getMany();
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
  const serversRepository = getConnection().getRepository(LocalServer);
  await serversRepository.insert(new LocalServer(server));
};

export const deleteServer = async (macAddress: string): Promise<void> => {
  const serversRepository = getConnection().getRepository(LocalServer);
  await serversRepository.delete(macAddress);
};
