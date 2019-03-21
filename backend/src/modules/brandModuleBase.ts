import * as fse from 'fs-extra';
import * as path from 'path';
import { PullBehavior } from 'pull-behavior';
import { BehaviorSubject } from 'rxjs';
import { Configuration } from '../config';
import { DeviceKind, ErrorResponse, Minion, MinionStatus } from '../models/sharedInterfaces';
import { logger } from '../utilities/logger';

/**
 * Any smart devices brand communication module needs to inherit..
 */
export abstract class BrandModuleBase {

    public static readonly CACHE_DIRACTORY = path.join('./data/', Configuration.runningMode, '/cache/');

    /**
     * Cache file pull path.
     */
    private get cacheFilePath(): string {
        return `${path.join(BrandModuleBase.CACHE_DIRACTORY, this.brandName)}.json`;
    }

    /**
     * Brand name, should be unique in system.
     */
    public readonly abstract brandName: string;

    /**
     * All supported devices via current module metadata.
     */
    public readonly abstract devices: DeviceKind[];

    /**
     * Let minions manager to know if any minion status changed by pysical interface of device.
     */
    public minionStatusChangedEvent = new BehaviorSubject<{
        minionId: string;
        status: MinionStatus;
    }>(undefined);

    /**
     * This PullBehavior Allows to retrieve minions array.
     * Used when new status arrived and need all minions array to know for witch minion update belong.
     * some of is by mac some by other data.
     */
    public retrieveMinions: PullBehavior<Minion[]> = new PullBehavior<Minion[]>();

    /**
     * Get cache JSON data sync.
     * Use it in init only. else the app will black until read finish.
     */
    protected getCacheDataSync(): any {
        try {
            return fse.readJSONSync(this.cacheFilePath);
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Get cache JSON data.
     */
    protected async getCacheData(): Promise<any> {
        const data = await fse.readJSON(this.cacheFilePath)
            .catch((err) => {
                logger.warn(`Fail to read ${this.cacheFilePath} cache file, ${err}`);
                throw new Error('Fail to read cache data');
            });
        return data;
    }

    /**
     * Save JSON to module cache.
     * @param data Data to save in cache.
     */
    protected async setCacheData(data: any): Promise<void> {
        await fse.outputFile(this.cacheFilePath, JSON.stringify(data, null, 2))
            .catch((err) => {
                logger.warn(`Fail to write ${this.cacheFilePath} cache file, ${err}`);
                throw new Error('Fail to write cache data');
            });
    }

    /**
     * Get current status of minion. (such as minion status on off etc.)
     * @param miniom minion to get status for.
     */
    public abstract getStatus(miniom: Minion): Promise<MinionStatus | ErrorResponse>;

    /**
     * Set minion new status. (such as turn minion on off etc.)
     * @param miniom minion to set status for.
     * @param setStatus the new status to set.
     */
    public abstract setStatus(miniom: Minion, setStatus: MinionStatus): Promise<void | ErrorResponse>;

    /**
     * Record data for currrent minion status.
     * Note, only a few devices models support this feature.
     * For example it is used when need to record IR data to math status for next use.
     * @param minion minion to record for.
     * @param statusToRecordFor the specific status to record for.
     */
    public abstract enterRecordMode(minion: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse>;

    /**
     * Generate an RF or IR command for given status. 
     * Note, only a few devices models support this feature.
     * For example, it is used to generate RF command to the RF wall switch, instead of buying remote and record the commands.
     * @param minion minion to generate for.
     * @param statusToGenerateFor the specific status to record for.
     */
    public abstract generateCommand(minion: Minion, statusToGenerateFor: MinionStatus): Promise<void | ErrorResponse>;
}
