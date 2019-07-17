import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RemoteConnectionStatus, RemoteSettings, IftttIntegrationSettings, UpdateResults, VersionInfo } from '../../../../backend/src/models/sharedInterfaces';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DeepCopy } from '../../../../backend/src/utilities/deepCopy';
import { ToasterAndErrorsService } from './toaster-and-errors.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public onlineFeed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public remoteStatusFeed: BehaviorSubject<RemoteConnectionStatus> = new BehaviorSubject<RemoteConnectionStatus>('notConfigured');

  constructor(private toastrAndErrorsService: ToasterAndErrorsService,
    private httpClient: HttpClient) {
    this.onlineAck();
  }



  private async onlineAck() {

    let remoteConnectionStatus: RemoteConnectionStatus;
    let liveliness: boolean;
    while (true) {
      try {

        remoteConnectionStatus = await this.httpClient.get<RemoteConnectionStatus>('/API/remote/status').toPromise();

        if (!this.onlineFeed.value) {
          this.onlineFeed.next(true);
        }

        if (remoteConnectionStatus !== this.remoteStatusFeed.value) {
          this.remoteStatusFeed.next(remoteConnectionStatus);
        }

      } catch (httpErrorResponse) {
        /** If request fail. check if the reasone is becuase the s. */
        const currStatus = httpErrorResponse['status'];
        liveliness = currStatus === 200 && currStatus === 204;
        if (this.onlineFeed.value !== liveliness) {
          this.onlineFeed.next(liveliness);
        }
      }


      /** Sleep for 15 sec. ;) */
      await this.sleep(15 * 1000);
    }
  }

  /** IFTTT integration area */

  public async isIftttIntegrationEnabled(): Promise<boolean> {
    try {
      return await this.httpClient.get<boolean>('/API/ifttt/settings').toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
      return false;
    }
  }

  public async disableIftttIntegration(): Promise<void> {
    const iftttSettings: IftttIntegrationSettings = {
      enableIntegration: false,
    };
    try {
      await this.httpClient.put('/API/ifttt/settings', iftttSettings).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async enableIftttInterration(apiKey: string) {
    const iftttSettings: IftttIntegrationSettings = {
      enableIntegration: true,
      apiKey,
    };
    try {
      await this.httpClient.put('/API/ifttt/settings', iftttSettings).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  /** Remote server area */

  public async getRemoteHostname(): Promise<string> {
    try {
      return await this.httpClient.get<string>('/API/remote').toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
      return '';
    }
  }

  public async disconnectRemote(): Promise<void> {
    try {
      await this.httpClient.delete('/API/remote').toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async getLocalServerMac(): Promise<string> {
    try {
      return await this.httpClient.get<string>('/API/remote/machine-mac').toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
      return '';
    }
  }

  public async setRemoteSettings(remoteSettings: RemoteSettings) {
    try {
      await this.httpClient.put('/API/remote', remoteSettings).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async getCurrentVersion(): Promise<VersionInfo> {
    try {
      return await this.httpClient.get<VersionInfo>('/API/version').toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async updateToLastVersion(): Promise<UpdateResults> {
    try {
      return await this.httpClient.put<UpdateResults>('/API/version/latest', {}).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
      throw error;
    }
  }

  private sleep(delayMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, delayMs);
    });
  }
}
