import { getConnection } from 'typeorm';

import { LocalServer, ServerSession } from '../models';

export const getServerSession = async (server: LocalServer): Promise<ServerSession> => {
  const serversSessionsRepository = getConnection().getRepository(ServerSession);
  return await serversSessionsRepository.findOne({
    where: {
      server,
    },
  });
};

export const checkSession = async (server: LocalServer, hashedKey: string): Promise<ServerSession> => {
  const serversSessionsRepository = getConnection().getRepository(ServerSession);
  return await serversSessionsRepository.findOneOrFail({
    where: {
      server,
      hashedKey,
    },
  });
};

export const setServerSession = async (serverSession: ServerSession): Promise<void> => {
  const serversSessionsRepository = getConnection().getRepository(ServerSession);
  try { await serversSessionsRepository.delete(serverSession); } catch (error) { }
  await serversSessionsRepository.create(serverSession);
};

export const deleteServerSession = async (serverSession: ServerSession): Promise<void> => {
  const serversSessionsRepository = getConnection().getRepository(ServerSession);
  await serversSessionsRepository.delete(serverSession);
};
