import { IDataIO } from '../models/backendInterfaces';
import { MinionTimeline } from '../models/sharedInterfaces';
import { DataIO } from './dataIO';
import { Configuration } from '../config';
import * as moment from 'moment';
import { logger } from '../utilities/logger';

const TIMELINE_FILE_NAME = 'timeline.json';
const TIMELINE_MS_LENGTH = moment.duration(Configuration.timelineDaysLength, 'days').asMilliseconds();

export class TimelineDal {

    private dataIo: IDataIO;


    /**
     * timeline.
     */
    private minionsTimeline: MinionTimeline[] = [];

    constructor(dataIo: IDataIO) {
        this.dataIo = dataIo;

        this.minionsTimeline = dataIo.getDataSync();
        /** remove too old nodes */
        this.removeOldNodes();
    }

    /**
     * Get current minions timeline.
     */
    public async getTimeline(): Promise<MinionTimeline[]> {
        return this.minionsTimeline;
    }

    /**
     * Add minion status node to the timeline.
     * @param minionTimeline the new timeline node to add .
     */
    public async addTimelinenode(minionTimeline: MinionTimeline): Promise<void> {

        /** First, remove the olds nodes. */
        this.removeOldNodes();

        /** Add node to the top of array */
        this.minionsTimeline.unshift(minionTimeline);

        /** Try save timeline */
        try {
            await this.dataIo.setData(this.minionsTimeline);
        } catch (error) {
            logger.warn('fail to save the updated timeline');
        }
    }

    /** Remove old nodes from the timeline */
    private removeOldNodes() {
        const newTimeline: MinionTimeline[] = [];
        const now = new Date().getTime();

        /** Iterate on all timeline nodes */
        for (const node of this.minionsTimeline) {
            /** If current node time too old, stop iterate timeline */
            if (now > node.timestamp + TIMELINE_MS_LENGTH) {
                break;
            }

            /** Add node to the bottom of the aarry  */
            newTimeline.push(node);
        }

        /** Keep the cleaned timeline */
        this.minionsTimeline = newTimeline;
    }
}

export const TimelineDalSingleton = new TimelineDal(new DataIO(TIMELINE_FILE_NAME));
