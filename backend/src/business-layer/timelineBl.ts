import { TimelineDal, TimelineDalSingleton } from '../data-layer/timelineDal';
import { Minion, MinionTimeline } from '../models/sharedInterfaces';
import { MinionsBl, MinionsBlSingleton } from './minionsBl';

/**
 * This class take care on all logic of timeline management.
 */
export class TimelineBl {
  /**
   * Init TimelineBl . using dependency injection pattern to allow units testings.
   * @param minionsBl Inject minionsBl instance.
   * @param timelineDal Inject timelineDal instance.
   */
  constructor(private minionsBl: MinionsBl, private timelineDal: TimelineDal) {
  }

  /** Get timeline nodes array */
  public async getTimeline(): Promise<MinionTimeline[]> {
    return await this.timelineDal.getTimeline();
  }

  public async initTimelineModule() {
    this.minionsBl.minionFeed.attach(minionFeed => {

      switch (minionFeed.event) {
        case 'update':
          try {
            this.onMinionUpdate(minionFeed.minion);
          } catch { }
          break;
      }
    });
  }

  /** Add node to the timeline */
  private onMinionUpdate(minion: Minion) {
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

export const TimelineBlSingleton = new TimelineBl(MinionsBlSingleton, TimelineDalSingleton);
