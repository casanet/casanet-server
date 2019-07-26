import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Minion, MinionStatus, MinionFeed, DeviceKind, MinionTimeline, CommandsRepoDevice } from '../../../../backend/src/models/sharedInterfaces';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DeepCopy } from '../../../../backend/src/utilities/deepCopy';
import { ToasterAndErrorsService } from './toaster-and-errors.service';

@Injectable({
	providedIn: 'root'
})
export class MinionsService {
	private isMinionsRetrived = false;
	private minionsServerFeed: EventSource;
	private minions: Minion[] = [];
	public minionsFeed: BehaviorSubject<Minion[]> = new BehaviorSubject<Minion[]>(this.minions);

	constructor(private toastrAndErrorsService: ToasterAndErrorsService, private httpClient: HttpClient) {
		this.retriveData();
	}

	public async getCommandsRepoAvailableDevices(): Promise<CommandsRepoDevice[]> {
		try {
			return await this.httpClient.get<CommandsRepoDevice[]>(`/API/rf/devices`).toPromise();
		} catch (error) {
			this.toastrAndErrorsService.OnHttpError(error);
			return null;
		}
	}

	public async fetchDeviceCommandsToMinion(minion: Minion, commandsRepoDevice: CommandsRepoDevice): Promise<void> {
		await this.httpClient.put(`/API/rf/fetch-commands/${minion.minionId}`, commandsRepoDevice).toPromise();
	}

	public async recordCommand(minion: Minion, minionStatus: MinionStatus) {
		try {
			await this.httpClient.post(`/API/rf/record/${minion.minionId}`, minionStatus).toPromise();
		} catch (error) {
			this.toastrAndErrorsService.OnHttpError(error);
		}
	}

	public async generateCommand(minion: Minion, minionStatus: MinionStatus) {
		try {
			await this.httpClient.post(`/API/rf/generate/${minion.minionId}`, minionStatus).toPromise();
		} catch (error) {
			this.toastrAndErrorsService.OnHttpError(error);
		}
	}

	public async refreshMinions() {
		if (this.minionsServerFeed) {
			this.minionsServerFeed.close();
		}

		this.minions = [];
		try {
			await this.httpClient.post(`/API/minions/rescan`, {}).toPromise();
			await this.loadMinions();
		} catch (error) {
			this.toastrAndErrorsService.OnHttpError(error);
		}
	}

	public async refreshMinion(minion: Minion) {
		try {
			await this.httpClient.post(`/API/minions/rescan/${minion.minionId}`, {}).toPromise();
		} catch (error) {
			this.toastrAndErrorsService.OnHttpError(error);
		}
		await this.patchMinions();
	}

	public getMinion(minionId): Minion {
		for (const minion of this.minions) {
			if (minion.minionId === minionId) {
				return minion;
			}
		}
	}
	private async patchMinions() {
		try {
			const minions = await this.httpClient.get<Minion[]>('/API/minions').toPromise();
			this.minions = minions;

			for (const minion of this.minions) {
				this.loadDefaultStatusValues(minion);
			}

			this.minionsFeed.next(DeepCopy<Minion[]>(this.minions));
		} catch (error) {
			this.isMinionsRetrived = false;
			this.toastrAndErrorsService.OnHttpError(error);
		}

	}

	private async loadMinions() {

		await this.patchMinions();

		if (this.minionsServerFeed) {
			this.minionsServerFeed.close();
		}

		this.minionsServerFeed = new EventSource('/API/feed/minions');
		this.minionsServerFeed.onmessage = (minionFeedEvent: MessageEvent) => {
			this.OnMinionFeedUpdate(minionFeedEvent);
		};
	}

	private loadDefaultStatusValues(minion: Minion) {
		if (
			!minion.minionStatus[minion.minionType] ||
			JSON.stringify(minion.minionStatus[minion.minionType]) === '{}'
		) {
			minion.minionStatus = {
				airConditioning: {
					fanStrength: 'auto',
					mode: 'auto',
					status: 'off',
					temperature: 16
				},
				colorLight: {
					blue: 1,
					brightness: 1,
					green: 1,
					red: 1,
					status: 'off',
					temperature: 1
				},
				light: {
					brightness: 1,
					status: 'off'
				},
				switch: {
					status: 'off'
				},
				roller: {
					status: 'off',
					direction: 'up',
				},
				temperatureLight: {
					brightness: 1,
					status: 'off',
					temperature: 1
				},
				toggle: {
					status: 'off'
				}
			};
		}
	}

	private async retriveMinions() {
		if (!this.isMinionsRetrived) {
			this.isMinionsRetrived = true;
			await this.loadMinions();
		}
	}

	private OnMinionFeedUpdate(minionFeedEvent: MessageEvent) {
		if (minionFeedEvent.data === '"init"') {
			return;
		}

		const minionFeed: MinionFeed = JSON.parse(minionFeedEvent.data);

		switch (minionFeed.event) {
			case 'update': {
				this.loadDefaultStatusValues(minionFeed.minion);
				const minion = this.findMinion(minionFeed.minion.minionId);
				if (minion) {
					this.minions.splice(this.minions.indexOf(minion), 1);
				}
				this.minions.push(minionFeed.minion);
				break;
			}
			case 'created': {
				this.loadDefaultStatusValues(minionFeed.minion);
				this.minions.push(minionFeed.minion);
				break;
			}
			case 'removed': {
				const minion = this.findMinion(minionFeed.minion.minionId);
				if (minion) {
					this.minions.splice(this.minions.indexOf(minion), 1);
				}
				break;
			}
		}

		this.minionsFeed.next(DeepCopy<Minion[]>(this.minions));
	}

	private findMinion(minoinId: string): Minion {
		for (const minion of this.minions) {
			if (minion.minionId === minoinId) {
				return minion;
			}
		}
	}

	public async setStatus(setMinion: Minion) {
		const minion = this.findMinion(setMinion.minionId);
		try {
			await this.httpClient.put(`/API/minions/${setMinion.minionId}`, setMinion.minionStatus).toPromise();

			minion.isProperlyCommunicated = true;
			minion.minionStatus = DeepCopy<MinionStatus>(setMinion.minionStatus);
		} catch (error) {
			minion.isProperlyCommunicated = false;
			this.toastrAndErrorsService.OnHttpError(error);
		}
		this.minionsFeed.next(DeepCopy<Minion[]>(this.minions));
	}

	public async deleteMinion(minionToRemove: Minion) {
		try {
			await this.httpClient.delete(`/API/minions/${minionToRemove.minionId}`).toPromise();

			const minion = this.findMinion(minionToRemove.minionId);
			if (minion) {
				this.minions.splice(this.minions.indexOf(minion), 1);
			}

			this.minionsFeed.next(DeepCopy<Minion[]>(this.minions));
		} catch (error) {
			this.toastrAndErrorsService.OnHttpError(error);

			/** Throw it next to caller */
			throw error;
		}
	}

	public async createMinion(minionToCreate: Minion) {
		try {
			await this.httpClient.post(`/API/minions`, minionToCreate).toPromise();
		} catch (error) {
			this.toastrAndErrorsService.OnHttpError(error);
		}
	}

	public async setAutoTimeout(minion: Minion, timeout: number) {
		try {
			await this.httpClient.put(`/API/minions/timeout/${minion.minionId}`, { setAutoTurnOffMS: timeout }).toPromise();
		} catch (error) {
			this.toastrAndErrorsService.OnHttpError(error);
		}
	}

	public async renameMinion(minion: Minion, newName: number) {
		try {
			await this.httpClient.put(`/API/minions/rename/${minion.minionId}`, { name: newName }).toPromise();
		} catch (error) {
			this.toastrAndErrorsService.OnHttpError(error);
		}
	}

	public async getTimeline(): Promise<MinionTimeline[]> {
		try {
			return await this.httpClient.get<MinionTimeline[]>(`/API/minions/timeline`).toPromise();
		} catch (error) {
			this.toastrAndErrorsService.OnHttpError(error);
		}
	}

	public async refreshData() {
		await this.loadMinions();
	}

	public async cleanUp() {
		this.isMinionsRetrived = false;
		this.minions = [];
		if (this.minionsServerFeed) {
			this.minionsServerFeed.close();
			this.minionsServerFeed = null;
		}
	}

	public async retriveData() {
		this.retriveMinions();
	}
}
