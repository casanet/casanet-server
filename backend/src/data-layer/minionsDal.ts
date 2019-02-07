import { IDataIO } from '../models/backendInterfaces';
import { ErrorResponse, Minion } from '../models/sharedInterfaces';
import { DataIO } from './dataIO';

const MINIONS_FILE_NAME = 'minions.json';

export class MinionsDal {

    private dataIo: IDataIO;

    /**
     * minions.
     */
    private minions: Minion[] = [];

    constructor(dataIo: IDataIO) {
        this.dataIo = dataIo;

        this.minions = dataIo.getDataSync();
    }

    /**
     * Find minion in minions array
     */
    private findMinion(minionId: string): Minion {
        for (const minion of this.minions) {
            if (minion.minionId === minionId) {
                return minion;
            }
        }
    }

    /**
     * Get all minions as array.
     */
    public async getMinions(): Promise<Minion[]> {
        return this.minions;
    }

    /**
     * Get minion by id.
     * @param minionId minion id.
     */
    public async getMinionById(minionId: string): Promise<Minion> {
        const minion = this.findMinion(minionId);

        if (!minion) {
            throw new Error('minion not exist');
        }
        return minion;
    }

    /**
     * Save new minion.
     * @param newMinion minoin to create.
     */
    public async createMinion(newMinion: Minion): Promise<void> {
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
    public async deleteMinion(minion: Minion): Promise<void> {
        const originalMinion = this.findMinion(minion.minionId);

        if (!originalMinion) {
            throw new Error('minion not exist');
        }

        this.minions.splice(this.minions.indexOf(originalMinion), 1);
        await this.dataIo.setData(this.minions)
            .catch(() => {
                this.minions.push(originalMinion);
                throw new Error('fail to save minion delete request');
            });
    }

    /**
     * Update minion auto turn off timeout.
     * @param minionId minion to timeout.
     * @param setAutoTurnOffMS ms to set (or -1/undefined to disable).
     */
    public async updateMinionAutoTurnOff(minionId: string, setAutoTurnOffMS: number): Promise<void> {
        const originalMinion = this.findMinion(minionId);

        if (!originalMinion) {
            throw {
                responseCode: 4004,
                message: 'minion not exist',
            } as ErrorResponse;
        }

        originalMinion.minionAutoTurnOffMS = setAutoTurnOffMS;

        await this.dataIo.setData(this.minions)
            .catch(() => {
                throw new Error('fail to save minion timeout update request');
            });
    }
}

export const MinionsDalSingleton = new MinionsDal(new DataIO(MINIONS_FILE_NAME));
