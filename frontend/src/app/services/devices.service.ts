import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Minion, MinionStatus, MinionFeed, DeviceKind } from '../../../../backend/src/models/sharedInterfaces';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DeepCopy } from '../../../../backend/src/utilities/deepCopy';
import { ToasterAndErrorsService } from './toaster-and-errors.service';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {

  private isDevicesDataRetrived = false;
  public devicesKinds: DeviceKind[] = [];

  constructor(private toastrAndErrorsService: ToasterAndErrorsService,
    private httpClient: HttpClient) {
      this.retriveDevicesData();
  }

  private async loadDevicessData() {
    try {
      const minions = await this.httpClient.get<DeviceKind[]>('/API/devices/kinds').toPromise();
      this.isDevicesDataRetrived = true;
      this.devicesKinds = minions;

    } catch (error) {
      this.isDevicesDataRetrived = false;
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async retriveDevicesData() {
    if (!this.isDevicesDataRetrived) {
      this.loadDevicessData();
    }
  }
}
