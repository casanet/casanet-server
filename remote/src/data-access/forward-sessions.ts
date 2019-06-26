import { getConnection } from 'typeorm';

import { ForwardSession } from '../models';

export const getForwardSession = async (hashedKey: string): Promise<ForwardSession> => {
  const forwardSessionsRepository = getConnection().getRepository(ForwardSession);
  return await forwardSessionsRepository.findOne({
    where: {
      hashedKey,
    },
  });
};

export const createForwardSession = async (forwardSession: ForwardSession): Promise<void> => {
  const forwardSessionsRepository = getConnection().getRepository(ForwardSession);
  await forwardSessionsRepository.create(forwardSession);
};

export const deleteForwardSession = async (hashedKey: string): Promise<void> => {
  const forwardSessionsRepository = getConnection().getRepository(ForwardSession);
  await forwardSessionsRepository.delete({ hashedKey });
};
