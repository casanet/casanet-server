"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const minionsBl_1 = require("./minionsBl");
const timelineDal_1 = require("../data-layer/timelineDal");
/**
 * This class take care on all logic of timeline management.
 */
class TimelineBl {
    /**
     * Init TimelineBl . using dependecy injection pattern to allow units testings.
     * @param minionsBl Inject minionsBl instance.
     * @param timelineDal Inject timelineDal instance.
     */
    constructor(minionsBl, timelineDal) {
        this.minionsBl = minionsBl;
        this.timelineDal = timelineDal;
        this.minionsBl.minionFeed.subscribe((minionFeed) => {
            if (!minionFeed) {
                return;
            }
            switch (minionFeed.event) {
                case 'update':
                    try {
                        this.onMinionUpdate(minionFeed.minion);
                    }
                    catch (_a) { }
                    ;
                    break;
            }
        });
    }
    /** Get timeline nodes array */
    async getTimeline() {
        return await this.timelineDal.getTimeline();
    }
    /** Add node to the timeline */
    onMinionUpdate(minion) {
        if (!minion.minionStatus[minion.minionType]) {
            return;
        }
        this.timelineDal.addTimelinenode({
            minionId: minion.minionId,
            timestamp: new Date().getTime(),
            status: minion.minionStatus,
        });
    }
}
exports.TimelineBl = TimelineBl;
exports.TimelineBlSingleton = new TimelineBl(minionsBl_1.MinionsBlSingleton, timelineDal_1.TimelineDalSingleton);
//# sourceMappingURL=timelineBl.js.map