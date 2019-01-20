import { BehaviorSubject } from 'rxjs';
import { DeviceKind, ErrorResponse, Minion, MinionStatus } from '../models/sharedInterfaces';
import { PullBehavior } from '../utilities/pullBehavior';

/**
 * Any smart devices brand communication module needs to inherit..
 */
export abstract class MinionsBrandModuleBase {

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
     * Note, only few devices models support this feature.
     * For example it is used when need to record IR data to math status for next use.
     * @param miniom minion to record for.
     * @param statusToRecordFor the specific status to record for.
     */
    public abstract enterRecordMode(miniom: Minion, statusToRecordFor: MinionStatus): Promise<void | ErrorResponse>;
}
