import { TimelineDal, TimelineDalSingleton } from '../data-layer/timelineDal';
import { Minion, MinionFeed, MinionTimeline } from '../models/sharedInterfaces';
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
	public async getTimeline(minionId?: string): Promise<MinionTimeline[]> {
		const minionsTimeline = await this.timelineDal.getTimeline();
		if (!minionId) {
			return minionsTimeline;
		}
		return minionsTimeline.filter(t => t.minionId === minionId);
	}

	public async initTimelineModule() {
		this.minionsBl.minionFeed.attach(minionFeed => {

			switch (minionFeed.event) {
				case 'update':
					try {
						this.onMinionUpdate(minionFeed);
					} catch { }
					break;
			}
		});
	}

	/** Add node to the timeline */
	private onMinionUpdate(minionFeed: MinionFeed) {
		const { minion, trigger, user } = minionFeed;

		// Do not keep unknown of sync actions
		if (!trigger || trigger === 'sync' || !minion.minionStatus[minion.minionType]) {
			return;
		}
		
		this.timelineDal.addTimelineNode({
			trigger,
			user: !user ? undefined : {
				name: user.displayName,
				email: user.email
			},
			minionId: minion.minionId,
			timestamp: new Date().getTime(),
			status: minion.minionStatus,
		});
	}
}

export const TimelineBlSingleton = new TimelineBl(MinionsBlSingleton, TimelineDalSingleton);
