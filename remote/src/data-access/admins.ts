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

export const updateUser = async (admin: RemoteAdmin): Promise<void> => {
  const usersRepository = getConnection().getRepository(RemoteAdmin);
  await usersRepository.save(new RemoteAdmin(admin));
};

export const createUser = async (admin: RemoteAdmin): Promise<void> => {
  const usersRepository = getConnection().getRepository(RemoteAdmin);
  await usersRepository.insert(new RemoteAdmin(admin));
};

export const deleteUser = async (email: string): Promise<void> => {
  const usersRepository = getConnection().getRepository(RemoteAdmin);
  await usersRepository.delete(email);
};
