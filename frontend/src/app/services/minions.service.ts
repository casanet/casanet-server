import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Minion, MinionStatus, MinionFeed } from '../../../../backend/src/models/sharedInterfaces';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DeepCopy } from '../../../../backend/src/utilities/deepCopy';
import { ToasterAndErrorsService } from './toaster-and-errors.service';

@Injectable({
  providedIn: 'root'
})
export class MinionsService {

  private minionsServerFeed: EventSource;
  private minions: Minion[] = [];
  public minionsFeed: BehaviorSubject<Minion[]> = new BehaviorSubject<Minion[]>(this.minions);

  constructor(private toastrAndErrorsService: ToasterAndErrorsService,
    private httpClient: HttpClient) {

  }

  public async retriveMinions() {
    try {
      const minions = await this.httpClient.get<Minion[]>('/API/minions').toPromise();
      this.minions = minions;
      this.minionsFeed.next(DeepCopy<Minion[]>(minions));
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }


    if (this.minionsServerFeed) {
      this.minionsServerFeed.close();
    }

    this.minionsServerFeed = new EventSource('/API/feed/minions');
    this.minionsServerFeed.onmessage = (minionFeedEvent: MessageEvent) => { this.OnMinionFeedUpdate(minionFeedEvent); } ;
  }

  private OnMinionFeedUpdate(minionFeedEvent: MessageEvent) {
    if (minionFeedEvent.lastEventId === '0') {
      return;
    }

    const minionFeed: MinionFeed = JSON.parse(minionFeedEvent.data);

    switch (minionFeed.event) {
      case 'update': {
        const minion = this.findMinion(minionFeed.minion.minionId);
        if (minion) {
          this.minions.splice(this.minions.indexOf(minion), 1);
        }
        this.minions.push(minionFeed.minion);
        break;
      }
      case 'created': {
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

}
