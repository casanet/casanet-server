import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Minion, MinionStatus, Operation, Timing, TimingFeed } from '../../../../backend/src/models/sharedInterfaces';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DeepCopy } from '../../../../backend/src/utilities/deepCopy';
import { ToasterAndErrorsService } from './toaster-and-errors.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimingsService {

  private isTimingsRetrived = false;
  private activatedTimingsServerFeed: EventSource;

  public timings: Timing[] = [];
  public timingsFeed: BehaviorSubject<Timing[]> = new BehaviorSubject<Timing[]>(this.timings);
  public timingActivatedFeed: BehaviorSubject<TimingFeed> = new BehaviorSubject<TimingFeed>(undefined);

  constructor(private toastrAndErrorsService: ToasterAndErrorsService,
    private httpClient: HttpClient) {

    this.retriveData();
  }

  private async loadTimings() {
    try {
      const timings = await this.httpClient.get<Timing[]>(`${environment.baseUrl}/timings`, {
        withCredentials: true
      }).toPromise();
      timings.sort((itemA, itemB) => {
        return itemA.timingName < itemB.timingName ? -1 : 1;
      });
      this.timings = timings;
      this.timingsFeed.next(this.timings);

    } catch (error) {
      this.isTimingsRetrived = false;
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  private async connectToTimingActivateFeed() {
    if (this.activatedTimingsServerFeed) {
      this.activatedTimingsServerFeed.close();
    }

    this.activatedTimingsServerFeed = new EventSource(`${environment.baseUrl}/feed/timings`, { withCredentials: true });
    this.activatedTimingsServerFeed.onmessage = (timingFeedEvent: MessageEvent) => {
      if (timingFeedEvent.data === '"init"') {
        return;
      }

      const timingDataFeed: TimingFeed = JSON.parse(timingFeedEvent.data);
      this.timingActivatedFeed.next(timingDataFeed);
    };
  }

  private async retriveTimingsFeed() {
    if (!this.activatedTimingsServerFeed) {
      await this.connectToTimingActivateFeed();
    }
  }

  private async retriveTimings() {
    if (!this.isTimingsRetrived) {
      this.isTimingsRetrived = true;
      await this.loadTimings();
    }
  }

  public getTiming(timingId: string): Timing {
    for (const timing of this.timings) {
      if (timing.timingId === timingId) {
        return timing;
      }
    }
  }

  public async createTiming(timing: Timing) {
    try {
      await this.httpClient.post(`${environment.baseUrl}/timings`, timing, {
        withCredentials: true
      }).toPromise();
      this.loadTimings();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async deleteTiming(timing: Timing) {
    try {
      await this.httpClient.delete(`${environment.baseUrl}/timings/${timing.timingId}`, {
        withCredentials: true
      }).toPromise();
      this.loadTimings();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async editTimings(timing: Timing) {
    try {
      await this.httpClient.put(`${environment.baseUrl}/timings/${timing.timingId}`, timing, {
        withCredentials: true
      }).toPromise();
      this.loadTimings();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async refreshData() {
    await this.loadTimings();
  }

  public async cleanUp() {
    this.isTimingsRetrived = false;
    this.timings = [];

    if (this.activatedTimingsServerFeed) {
      this.activatedTimingsServerFeed.close();
      this.activatedTimingsServerFeed = null;
    }
  }

  public async retriveData() {
    this.retriveTimings();
    this.retriveTimingsFeed();
  }
}
