"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("./dataIO");
const MINIONS_FILE_NAME = 'minions.json';
class MinionsDal {
    constructor(dataIo) {
        /**
         * minions.
         */
        this.minions = [];
        this.dataIo = dataIo;
        this.minions = dataIo.getDataSync();
    }
    /**
     * Find minion in minions array
     */
    findMinion(minionId) {
        for (const minion of this.minions) {
            if (minion.minionId === minionId) {
                return minion;
            }
        }
    }
    /**
     * Get all minions as array.
     */
    async getMinions() {
        return this.minions;
    }
    /**
     * Get minion by id.
     * @param minionId minion id.
     */
    async getMinionById(minionId) {
        const minion = this.findMinion(minionId);
        if (!minion) {
            throw {
                responseCode: 1404,
                message: 'minion not exist',
            };
        }
        return minion;
    }
    /**
     * Save new minion.
     * @param newMinion minoin to create.
     */
    async createMinion(newMinion) {
        this.minions.push(newMinion);
        await this.dataIo.setData(this.minions)
            .catch(() => {
            this.minions.splice(this.minions.indexOf(newMinion), 1);
            throw new Error('fail to save minion');
        });
    }
    /**
     * Delete minion.
     * @param minion minion to delete.
     */
    async deleteMinion(minion) {
        const originalMinion = this.findMinion(minion.minionId);
        if (!originalMinion) {
            throw {
                responseCode: 1404,
                message: 'minion not exist',
            };
        }
        this.minions.splice(this.minions.indexOf(originalMinion), 1);
        await this.dataIo.setData(this.minions)
            .catch(() => {
            this.minions.push(originalMinion);
            throw new Error('fail to save minion delete request');
        });
    }
    /**
     * Rename minion.
     * @param minionId minion id.
     * @param nameToSet the new name to set.
     */
    async renameMinion(minionId, nameToSet) {
        const originalMinion = this.findMinion(minionId);
        if (!originalMinion) {
            throw {
                responseCode: 1404,
                message: 'minion not exist',
            };
        }
        originalMinion.name = nameToSet;
        await this.dataIo.setData(this.minions)
            .catch(() => {
            throw new Error('fail to save minion new name update request');
        });
    }
    /**
     * Update minion auto turn off timeout.
     * @param minionId minion to timeout.
     * @param setAutoTurnOffMS ms to set (or -1/undefined to disable).
     */
    async updateMinionAutoTurnOff(minionId, setAutoTurnOffMS) {
        const originalMinion = this.findMinion(minionId);
        if (!originalMinion) {
            throw {
                responseCode: 1404,
                message: 'minion not exist',
            };
        }
        originalMinion.minionAutoTurnOffMS = setAutoTurnOffMS;
        await this.dataIo.setData(this.minions)
            .catch(() => {
            throw new Error('fail to save minion timeout update request');
        });
    }
    /**
     * Update minion calibration property.
     * @param minionId minion to edit.
     * @param calibrationCycleMinutes seconds to set (or 0 to disable).
     */
    async updateMinionCalibrate(minionId, calibrationCycleMinutes) {
        const originalMinion = this.findMinion(minionId);
        if (!originalMinion) {
            throw {
                responseCode: 1404,
                message: 'minion not exist',
            };
        }
        originalMinion.calibrationCycleMinutes = calibrationCycleMinutes;
        await this.dataIo.setData(this.minions)
            .catch(() => {
            throw new Error('fail to save minion calibrate update request');
        });
    }
}
exports.MinionsDal = MinionsDal;
exports.MinionsDalSingleton = new MinionsDal(new dataIO_1.DataIO(MINIONS_FILE_NAME));
//# sourceMappingURL=minionsDal.js.map