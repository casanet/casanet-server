"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const models_1 = require("../models");
exports.getServers = async () => {
    const serversRepository = typeorm_1.getConnection().getRepository(models_1.LocalServer);
    return await serversRepository.find();
};
exports.getServer = async (macAddress) => {
    const serversRepository = typeorm_1.getConnection().getRepository(models_1.LocalServer);
    return await serversRepository.findOne({
        where: {
            macAddress
        }
    });
};
exports.getServersByForwardUser = async (user) => {
    const serversRepository = typeorm_1.getConnection().getRepository(models_1.LocalServer);
    return await serversRepository
        .createQueryBuilder('server')
        .where(':user =ANY(server.valid_users)', { user })
        .getMany();
};
exports.updateServer = async (server) => {
    const { displayName, validUsers, macAddress } = server;
    const serversRepository = typeorm_1.getConnection().getRepository(models_1.LocalServer);
    await serversRepository.update(macAddress, {
        displayName,
        validUsers,
    });
};
exports.createServer = async (server) => {
    const serversRepository = typeorm_1.getConnection().getRepository(models_1.LocalServer);
    await serversRepository.insert(new models_1.LocalServer(server));
};
exports.deleteServer = async (macAddress) => {
    const serversRepository = typeorm_1.getConnection().getRepository(models_1.LocalServer);
    await serversRepository.delete(macAddress);
};
//# sourceMappingURL=local-servers.js.map