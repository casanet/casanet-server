import { IDataIO } from '../models/backendInterfaces';
import { ErrorResponse, Timing } from '../models/sharedInterfaces';
import { DataIO } from './dataIO';

const TIMINGS_FILE_NAME = 'timings.json';

export class TimingsDal {

    private dataIo: IDataIO;

    /**
     * timings.
     */
    private timings: Timing[] = [];

    constructor(dataIo: IDataIO) {
        this.dataIo = dataIo;

        this.timings = dataIo.getDataSync();
    }

    /**
     * Find timing in timings array
     */
    private findTiming(timingId: string): Timing {
        for (const timing of this.timings) {
            if (timing.timingId === timingId) {
                return timing;
            }
        }
    }

    /**
     * Get all timings as array.
     */
    public async getTimings(): Promise<Timing[]> {
        return this.timings;
    }

    /**
     * Get timing by id.
     * @param timingId timing id.
     */
    public async getTimingById(timingId: string): Promise<Timing> {
        const timing = this.findTiming(timingId);

        if (!timing) {
            throw new Error('timing not exist');
        }
        return timing;
    }

    /**
     * Save new timing.
     * @param newTiming timing to create.
     */
    public async createTiming(newTiming: Timing): Promise<void> {
        this.timings.push(newTiming);

        await this.dataIo.setData(this.timings)
            .catch(() => {
                this.timings.splice(this.timings.indexOf(newTiming), 1);
                throw new Error('fail to save timing');
            });
    }

    /**
     * Delete timing.
     * @param timing timing to delete.
     */
    public async deleteTiming(timingId: string): Promise<void> {
        const originalMinion = this.findTiming(timingId);

        if (!originalMinion) {
            throw new Error('timing not exist');
        }

        this.timings.splice(this.timings.indexOf(originalMinion), 1);
        await this.dataIo.setData(this.timings)
            .catch(() => {
                this.timings.push(originalMinion);
                throw new Error('fail to save timing delete request');
            });
    }

    /**
     * Update timing.
     * @param timing timing to update.
     */
    public async updateTiming(timing: Timing): Promise<void> {
        const originalMinion = this.findTiming(timing.timingId);

        if (!originalMinion) {
            throw {
                responseCode : 4004,
                message: 'timing not exist',
            } as ErrorResponse;
        }

        this.timings.splice(this.timings.indexOf(originalMinion), 1);
        this.timings.push(timing);
        await this.dataIo.setData(this.timings)
            .catch(() => {
                this.timings.splice(this.timings.indexOf(timing), 1);
                this.timings.push(originalMinion);
                throw new Error('fail to save timing update request');
            });
    }
}

export const TimingsDalSingleton = new TimingsDal(new DataIO(TIMINGS_FILE_NAME));
