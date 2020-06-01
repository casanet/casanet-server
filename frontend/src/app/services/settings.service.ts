import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  RemoteConnectionStatus,
  RemoteSettings,
  IftttIntegrationSettings,
  UpdateResults,
  VersionInfo,
  VersionUpdateStatus,
  ProgressStatus,
  User
} from '../../../../backend/src/models/sharedInterfaces';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { DeepCopy } from '../../../../backend/src/utilities/deepCopy';
import { ToasterAndErrorsService } from './toaster-and-errors.service';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private readonly DETECT_LATEST_VERSION_ACTIVATION_MS = 1000 * 60 * 60 * 24 * 7; // ms s m h d w

  public onlineFeed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isUpToDateFeed: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public remoteStatusFeed: BehaviorSubject<RemoteConnectionStatus> = new BehaviorSubject<RemoteConnectionStatus>('notConfigured');

  private intervalHandler: number;

  constructor(private toastrAndErrorsService: ToasterAndErrorsService,
    private authService: AuthService,
    private httpClient: HttpClient) {
    this.onlineAck();

    authService.userProfile.subscribe(async (user: User) => {
      if (this.intervalHandler) {
        clearInterval(this.intervalHandler);
      }

      if (user.scope === 'adminAuth') {
        await this.detectIsVersionUpToDate();
        this.intervalHandler = setInterval(async () => {
          await this.detectIsVersionUpToDate();
        },
          this.DETECT_LATEST_VERSION_ACTIVATION_MS) as unknown as number;
      }
    });
  }

  private async onlineAck() {

    let remoteConnectionStatus: RemoteConnectionStatus;
    let liveliness: boolean;
    while (true) {
      try {

        remoteConnectionStatus = await this.httpClient.get<RemoteConnectionStatus>(`${environment.baseUrl}/remote/status`, {
          withCredentials: true,
        }).toPromise();

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
      return await this.httpClient.get<boolean>(`${environment.baseUrl}/ifttt/settings`, {
        withCredentials: true
      }).toPromise();
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
      await this.httpClient.put(`${environment.baseUrl}/ifttt/settings`, iftttSettings, {
        withCredentials: true
      }).toPromise();
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
      await this.httpClient.put(`${environment.baseUrl}/ifttt/settings`, iftttSettings, {
        withCredentials: true
      }).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  /** Remote server area */

  public async getRemoteHostname(): Promise<string> {
    try {
      return await this.httpClient.get<string>(`${environment.baseUrl}/remote`, {
        withCredentials: true
      }).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
      return '';
    }
  }

  public async disconnectRemote(): Promise<void> {
    try {
      await this.httpClient.delete(`${environment.baseUrl}/remote`, {
        withCredentials: true
      }).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async getLocalServerMac(): Promise<string> {
    try {
      return await this.httpClient.get<string>(`${environment.baseUrl}/remote/machine-mac`, {
        withCredentials: true
      }).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
      return '';
    }
  }

  public async setRemoteSettings(remoteSettings: RemoteSettings) {
    try {
      await this.httpClient.put(`${environment.baseUrl}/remote`, remoteSettings, {
        withCredentials: true
      }).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async getCurrentVersion(): Promise<VersionInfo> {
    try {
      return await this.httpClient.get<VersionInfo>(`${environment.baseUrl}/version`, {
        withCredentials: true
      }).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
    }
  }

  public async updateToLastVersion(): Promise<UpdateResults> {
    try {
      return await this.httpClient.put<UpdateResults>(`${environment.baseUrl}/version/latest`, {}, {
        withCredentials: true
      }).toPromise();
    } catch (error) {
      this.toastrAndErrorsService.OnHttpError(error);
      throw error;
    }
  }

  public async waitForVersionUpdate(): Promise<ProgressStatus> {
    let updateStatus: ProgressStatus = 'inProgress';
    while (updateStatus === 'inProgress') {
      try {
        const currentStatus = await this.httpClient.get<VersionUpdateStatus>(`${environment.baseUrl}/version/update-status`, {
          withCredentials: true
        }).toPromise();
        updateStatus = currentStatus.updateStatus;
      } catch (error) {
        // In case the server is temporary offline consider it as 'inProgress'
        updateStatus = 'inProgress';
      }
      await this.sleep(5000);
    }
    return updateStatus;
  }

  public async downloadLogs() {
    window.open(`${environment.baseUrl}/logs`);
  }

  public async detectIsVersionUpToDate() {
    try {
      const latestVersion = await this.httpClient.get<string>(`${environment.baseUrl}/version/is-up-date`, {
        withCredentials: true
      }).toPromise();
      this.isUpToDateFeed.next(latestVersion ? latestVersion : '');
    } catch (error) {
      console.log(error);
    }
  }

  public async downloadBackup() {
    window.open(`${environment.baseUrl}/backup`);
  }

  private sleep(delayMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, delayMs);
    });
  }
}
