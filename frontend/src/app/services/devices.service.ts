import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Minion, MinionStatus, MinionFeed, DeviceKind, LocalNetworkDevice } from '../../../../backend/src/models/sharedInterfaces';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DeepCopy } from '../../../../backend/src/utilities/deepCopy';
import { ToasterAndErrorsService } from './toaster-and-errors.service';

@Injectable({
  providedIn: 'root'
})
export class DevicesService {

  private isDevicesKindsRetrived = false;
  private isLanDevicesRetrived = false;
  public devicesKinds: DeviceKind[] = [];

  public lanDevices: LocalNetworkDevice[] = [];
  public lanDevicesFeed: BehaviorSubject<LocalNetworkDevice[]> = new BehaviorSubject<LocalNetworkDevice[]>(this.lanDevices);

  constructor(private toastrAndErrorsService: ToasterAndErrorsService,
    private httpClient: HttpClient) {
    this.retriveDevicesKindsData();
    this.loadLanDevices();
  }

  private async loadDevicesKindsData() {
    try {
      const minions = await this.httpClient.get<DeviceKind[]>('/API/devices/kinds').toPromise();
      this.isDevicesKindsRetrived = true;
      this.devicesKinds = minions;

    } catch (error) {
      this.isDevicesKindsRetrived = false;
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async retriveDevicesKindsData() {
    if (!this.isDevicesKindsRetrived) {
      this.loadDevicesKindsData();
    }
  }


  private async loadLanDevices() {
    try {
      const lanDevices = await this.httpClient.get<LocalNetworkDevice[]>('/API/devices').toPromise();
      this.isLanDevicesRetrived = true;
      this.lanDevices = lanDevices;

      this.lanDevicesFeed.next(DeepCopy<LocalNetworkDevice[]>(this.lanDevices));
    } catch (error) {
      this.isLanDevicesRetrived = false;
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async retriveLanDevices() {
    if (!this.isLanDevicesRetrived) {
      this.loadLanDevices();
    }
  }

  public async rescanLanDevices() {

    this.lanDevices = [];
    try {
      await this.httpClient.post(`/API/devices/rescan`, {}).toPromise();
      await this.loadLanDevices();

    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }
}
