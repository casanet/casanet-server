import { getConnection } from 'typeorm';
import { RemoteAdmin } from '../models';
import { Login } from '../../../backend/src/models/sharedInterfaces';
import * as bcrypt from 'bcryptjs';

export const getUsers = async (): Promise<RemoteAdmin[]> => {
  const usersRepository = getConnection().getRepository(RemoteAdmin);
  return await usersRepository.find();
};

export const getUser = async (email: string): Promise<RemoteAdmin> => {
  const usersRepository = getConnection().getRepository(RemoteAdmin);
  return await usersRepository.findOneOrFail({
    where: {
      email,
    }
  });
};

export const checkUserAccess = async (login: Login): Promise<RemoteAdmin> => {
  const { email, password } = login;

  const adminsRepository = getConnection().getRepository(RemoteAdmin);

  const userAccount = await adminsRepository
    .createQueryBuilder('admin')
    .addSelect('admin.password')
    .where('admin.email = :email', { email })
    .getOne();

  if (!userAccount) {
    return null;
  }

  const comparePasswords = await bcrypt.compare(password, userAccount.password);

  delete userAccount.password;

  return comparePasswords ? userAccount : null;
};

export const updateUser = async (user: RemoteAdmin): Promise<void> => {
  const { email, displayName, ignoreTfa } = user;
  const usersRepository = getConnection().getRepository(RemoteAdmin);
  await usersRepository.update(email, {
    displayName,
    ignoreTfa,
  });
};

export const updateUserPassword = async (email: string, password: string): Promise<void> => {
  const usersRepository = getConnection().getRepository(RemoteAdmin);
  await usersRepository.update(email, {
    password,
  });
};

export const createUser = async (user: RemoteAdmin): Promise<void> => {
  const usersRepository = getConnection().getRepository(RemoteAdmin);
  await usersRepository.create(user);
};

export const deleteUser = async (email: string): Promise<void> => {
  const usersRepository = getConnection().getRepository(RemoteAdmin);
  await usersRepository.delete(email);
};
