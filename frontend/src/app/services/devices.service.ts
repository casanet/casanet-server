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
  }

  private async loadDevicesKindsData() {
    try {
      const devices = await this.httpClient.get<DeviceKind[]>('/API/devices/kinds').toPromise();
      this.isDevicesKindsRetrived = true;
      this.devicesKinds = devices;

    } catch (error) {
      this.isDevicesKindsRetrived = false;
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async retriveDevicesKindsData() {
    if (!this.isDevicesKindsRetrived) {
      await this.loadDevicesKindsData();
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
      await this.loadLanDevices();
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

  public async setDeviceName(localNetworkDevice: LocalNetworkDevice, name: string) {
    try {
      const { mac } = localNetworkDevice;
      await this.httpClient.put(`/API/devices/${localNetworkDevice.mac}`, {
        name,
        mac,
      }).toPromise();
      this.loadLanDevices();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async cleanUp() {
    this.isDevicesKindsRetrived = false;
    this.isLanDevicesRetrived = false;
    this.devicesKinds = [];
    this.lanDevices = [];
  }
}
