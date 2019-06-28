"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const models_1 = require("../models");
exports.checkSession = async (server, hashedKey) => {
    const serversSessionsRepository = typeorm_1.getConnection().getRepository(models_1.ServerSession);
    return await serversSessionsRepository.findOneOrFail({
        where: {
            server,
            hashedKey,
        },
    });
};
exports.setServerSession = async (serverSession) => {
    const serversSessionsRepository = typeorm_1.getConnection().getRepository(models_1.ServerSession);
    await serversSessionsRepository.save(serverSession);
};
exports.deleteServerSession = async (serverSession) => {
    const serversSessionsRepository = typeorm_1.getConnection().getRepository(models_1.ServerSession);
    await serversSessionsRepository.delete(serverSession);
};
//# sourceMappingURL=servers-sessions.js.map