import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Minion, MinionStatus, Operation, Timing } from '../../../../backend/src/models/sharedInterfaces';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DeepCopy } from '../../../../backend/src/utilities/deepCopy';
import { ToasterAndErrorsService } from './toaster-and-errors.service';

@Injectable({
  providedIn: 'root'
})
export class TimingsService {

  private isTimingsRetrived = false;

  public timings: Timing[] = [];
  public timingsFeed: BehaviorSubject<Timing[]> = new BehaviorSubject<Timing[]>(this.timings);

  constructor(private toastrAndErrorsService: ToasterAndErrorsService,
    private httpClient: HttpClient) {
  }

  private async loadTimings() {
    try {
      const timings = await this.httpClient.get<Timing[]>('/API/timings').toPromise();
      this.isTimingsRetrived = true;
      this.timings = timings;
      this.timingsFeed.next(this.timings);
    } catch (error) {
      this.isTimingsRetrived = false;
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async retriveTimings() {
    if (!this.isTimingsRetrived) {
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
      await this.httpClient.post('/API/timings', timing).toPromise();
      this.loadTimings();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async deleteTiming(timing: Timing) {
    try {
      await this.httpClient.delete(`/API/timings/${timing.timingId}`).toPromise();
      this.loadTimings();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async editTimings(timing: Timing) {
    try {
      await this.httpClient.put(`/API/timings/${timing.timingId}`, timing).toPromise();
      this.loadTimings();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async cleanUp() {
    this.isTimingsRetrived = false;
    this.timings = [];
  }
}
