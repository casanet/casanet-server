"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const models_1 = require("../models");
const bcrypt = require("bcryptjs");
exports.getUsers = async () => {
    const usersRepository = typeorm_1.getConnection().getRepository(models_1.RemoteAdmin);
    return await usersRepository.find();
};
exports.getUser = async (email) => {
    const usersRepository = typeorm_1.getConnection().getRepository(models_1.RemoteAdmin);
    return await usersRepository.findOneOrFail({
        where: {
            email,
        }
    });
};
exports.checkAdminAccess = async (login) => {
    const { email, password } = login;
    const adminsRepository = typeorm_1.getConnection().getRepository(models_1.RemoteAdmin);
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
exports.updateUser = async (admin) => {
    const usersRepository = typeorm_1.getConnection().getRepository(models_1.RemoteAdmin);
    await usersRepository.save(new models_1.RemoteAdmin(admin));
};
exports.createUser = async (admin) => {
    const usersRepository = typeorm_1.getConnection().getRepository(models_1.RemoteAdmin);
    await usersRepository.insert(new models_1.RemoteAdmin(admin));
};
exports.deleteUser = async (email) => {
    const usersRepository = typeorm_1.getConnection().getRepository(models_1.RemoteAdmin);
    await usersRepository.delete(email);
};
//# sourceMappingURL=admins.js.map