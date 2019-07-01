"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataIO_1 = require("./dataIO");
const config_1 = require("../config");
const moment = require("moment");
const logger_1 = require("../utilities/logger");
const TIMELINE_FILE_NAME = 'timeline.json';
const TIMELINE_MS_LENGTH = moment.duration(config_1.Configuration.timelineDaysLength, 'days').asMilliseconds();
class TimelineDal {
    constructor(dataIo) {
        /**
         * timeline.
         */
        this.minionsTimeline = [];
        this.dataIo = dataIo;
        this.minionsTimeline = dataIo.getDataSync();
        /** remove too old nodes */
        this.removeOldNodes();
    }
    /**
     * Get current minions timeline.
     */
    async getTimeline() {
        return this.minionsTimeline;
    }
    /**
     * Add minion status node to the timeline.
     * @param minionTimeline the new timeline node to add .
     */
    async addTimelinenode(minionTimeline) {
        /** First, remove the olds nodes. */
        this.removeOldNodes();
        /** Add node to the top of array */
        this.minionsTimeline.unshift(minionTimeline);
        /** Try save timeline */
        try {
            await this.dataIo.setData(this.minionsTimeline);
        }
        catch (error) {
            logger_1.logger.warn('fail to save the updated timeline');
        }
    }
    /** Remove old nodes from the timeline */
    removeOldNodes() {
        const newTimeline = [];
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
exports.TimelineDal = TimelineDal;
exports.TimelineDalSingleton = new TimelineDal(new dataIO_1.DataIO(TIMELINE_FILE_NAME));
//# sourceMappingURL=timelineDal.js.map