import { Component, OnInit, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SettingsService } from '../../services/settings.service';
import {
    RemoteConnectionStatus,
    RemoteSettings,
    User,
    UpdateResults,
    VersionInfo,
    VersionUpdateStatus,
    ProgressStatus
} from '../../../../../backend/src/models/sharedInterfaces';
import swal, { SweetAlertResult } from 'sweetalert2';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '../../translate.service';
import { ManageRegisteredUsersComponent } from '../../dialogs/manage-registared-users-dialog/manage-registared-users-dialog.component';
import { TranslatePipe } from '../../translate.pipe';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'cdk-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

    remoteConnectionSubscription: Subscription;
    remoteConnection: RemoteConnectionStatus;
    iftttIntegration: boolean;

    remoteHostname: string;

    userProfile: User = {} as unknown as User;
    userProfileSubscription: Subscription;

    currentVersionName: string;
    currentVersionReleaseDate: string;


    private translatePipe: TranslatePipe;

    constructor(private settingsService: SettingsService,
        private authService: AuthService,
        public dialog: MatDialog,
        private translateService: TranslateService) {

        this.translatePipe = new TranslatePipe(this.translateService);


        this.remoteConnectionSubscription =
            this.settingsService.remoteStatusFeed.subscribe((remoteConnection) => {
                this.remoteConnection = remoteConnection;
            });

        this.userProfileSubscription =
            this.authService.userProfile.subscribe((userProfile) => {
                this.userProfile = userProfile;
            });
        this.loadRemoteHostName();
        this.loadIftttIntegration();
        this.loadCurrentVersion();
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.remoteConnectionSubscription.unsubscribe();
        this.userProfileSubscription.unsubscribe();
    }

    private async loadCurrentVersion() {
        try {
            const currVersion = await this.settingsService.getCurrentVersion();
            this.currentVersionName = `${currVersion.version} (${currVersion.commintHash})`;
            this.currentVersionReleaseDate = new Date(currVersion.timestamp).toLocaleDateString();
        } catch (error) {
            this.currentVersionName = 'unknown';
            this.currentVersionReleaseDate = 'unknown';
        }

    }
    private async loadRemoteHostName() {
        this.remoteHostname = await this.settingsService.getRemoteHostname();
    }

    private async loadIftttIntegration() {
        this.iftttIntegration = await this.settingsService.isIftttIntegrationEnabled();
    }

    public async disconnectRemoteServer() {

        const swalResult: void | SweetAlertResult = await swal({
            type: 'question',
            title: `${this.translatePipe.transform('SURE')}?`,
            showCancelButton: true,
            confirmButtonColor: 'red',
            cancelButtonText: this.translatePipe.transform('CANCEL'),
            confirmButtonText: this.translatePipe.transform('DISCONNECT'),
        });

        if (!swalResult.value || swalResult.dismiss) {
            return;
        }

        await this.settingsService.disconnectRemote();
        await this.loadRemoteHostName();
    }
    public async showMacAddress() {
        let mac = '';
        await swal({
            title: this.translatePipe.transform('READING_MAC'),
            timer: 2000,
            onBeforeOpen: async () => {
                swal.showLoading();
                swal.stopTimer();
                mac = await this.settingsService.getLocalServerMac();
                swal.resumeTimer();
            },
        });

        await swal({
            type: 'info',
            title: this.translatePipe.transform('MAC'),
            html: mac,
            confirmButtonText: 'OK'
        });
    }

    public showRegisteredUsers() {
        this.dialog.open(ManageRegisteredUsersComponent, {
            data: {}
        });
    }

    public async setRemoteServer() {
        await swal.mixin({
            input: 'text',
            confirmButtonText: this.translatePipe.transform('NEXT'),
            showCancelButton: true,
            cancelButtonText: this.translatePipe.transform('CANCEL'),
            progressSteps: ['1', '2']
        }).queue([
            {
                title: this.translatePipe.transform('REMOTE_URI'),
                text: `${this.translatePipe.transform('FORMAT')}: [ws/wss]://[hostname]`,
                onOpen: () => {
                    swal.disableConfirmButton();
                    swal.getInput().addEventListener('input', (e: KeyboardEvent) => {
                        if (!e.target['value']) {
                            swal.disableConfirmButton();
                        } else {

                            const data = e.target['value'] as string;
                            const isWss = data.indexOf('wss') !== -1;
                            const isWs = data.indexOf('ws') !== -1;

                            if (!isWss && !isWs) {
                                swal.disableConfirmButton();
                                return;
                            }

                            // Replace to http, just for using URL object as tester.
                            const urlTest = 'http' + data.slice(isWss ? 3 : 2);

                            try {
                                const url = new URL(urlTest);
                                swal.enableConfirmButton();
                            } catch (error) {
                                swal.disableConfirmButton();
                            }

                        }
                    });
                },
            },
            this.translatePipe.transform('API_KEY'),
        ]).then(async (result) => {
            if (result.value) {

                await swal({
                    title: this.translatePipe.transform('SETTING_REMOTE_SERVER'),
                    timer: 15000,
                    onBeforeOpen: async () => {
                        swal.showLoading();
                        swal.stopTimer();
                        const remoteSettings: RemoteSettings = {
                            host: result.value[0],
                            connectionKey: result.value[1],
                        };
                        await this.settingsService.setRemoteSettings(remoteSettings);
                        await this.loadRemoteHostName();
                        swal.resumeTimer();
                    },
                });

            }
        });
    }

    /** IFTTT */

    public async disableIfttt() {

        const swalResult: void | SweetAlertResult = await swal({
            type: 'question',
            title: `${this.translatePipe.transform('SURE')}?`,
            showCancelButton: true,
            confirmButtonColor: 'red',
            cancelButtonText: this.translatePipe.transform('CANCEL'),
            confirmButtonText: this.translatePipe.transform('DISCONNECT'),
        });

        if (!swalResult.value || swalResult.dismiss) {
            return;
        }

        await this.settingsService.disableIftttIntegration();
        await this.loadIftttIntegration();
    }

    public async setIfttt() {
        const swalResult: void | SweetAlertResult = await swal({
            title: this.translatePipe.transform('PRESS_IFTTT_API_KEY'),
            input: 'text',
            showCancelButton: true,
            cancelButtonText: this.translatePipe.transform('CANCEL'),
            confirmButtonText: this.translatePipe.transform('SUBMIT'),
        });

        if (!swalResult.value || swalResult.dismiss) {
            return;
        }
        const apiKey = swalResult.value;
        await swal({
            title: this.translatePipe.transform('SETTING_IFTTT'),
            timer: 2000,
            onBeforeOpen: async () => {
                swal.showLoading();
                swal.stopTimer();
                await this.settingsService.enableIftttInterration(apiKey);
                await this.loadIftttIntegration();
                swal.resumeTimer();
            },
        });
    }

    /** Versioning */
    public async updateVertionToLast() {
        const swalResult: void | SweetAlertResult = await swal({
            imageUrl: './assets/icons/baseline_system_update_black_48dp.png',
            title: this.translatePipe.transform('UPDATE_TO_THE_LAST_VERSION'),
            text: this.translatePipe.transform('UPDATING_WARNING'),
            showLoaderOnConfirm: true,
            confirmButtonText: this.translatePipe.transform('UPDATE'),
            showCancelButton: false,
            allowOutsideClick: () => !swal.isLoading(),
            preConfirm: async () => {
                try {
                    const startingUpdateRes = await this.settingsService.updateToLastVersion();
                    if (startingUpdateRes.alreadyUpToDate) {
                        return startingUpdateRes;
                    }
                    return await this.settingsService.waitForVersionUpdate();
                } catch (error) {
                    return false;
                }
            },
        });

        if (!swalResult.value || swalResult.dismiss) {
            return;
        }

        const updateResults: UpdateResults = swalResult.value;

        if (updateResults.alreadyUpToDate) {
            await swal({
                type: 'info',
                title: `${this.translatePipe.transform('SYSTEM_ALREADY_UP_TO_DATE')}`,
                confirmButtonText: 'OK'
            });
            return;
        }

        const updateStatus: ProgressStatus = swalResult.value;

        if (updateStatus === 'fail') {
            await swal({
                type: 'error',
                title: `${this.translatePipe.transform('UPDATE_SYSTEM_FAIL')}`,
                text: `${this.translatePipe.transform('CONTACT_SUPPORT_OR_CHECK_LOCAL_SERVER_HEALTH')}`,
                confirmButtonText: 'OK'
            });
            return;
        }


        await this.loadCurrentVersion();
        await swal({
            type: 'success',
            title: `${this.translatePipe.transform('SUCCESSFULLY_UPDATED_TO')} ${this.currentVersionName}`,
            confirmButtonText: 'OK'
        });
    }

    public async setLang(lang: string) {
        await this.translateService.setLeng(lang);
    }

    /** PWA */
    public async installPWA() {
        localStorage.setItem('use-sw', 'true');
        /** refresh page to acvtivate changes */
        window.location.reload();

    }

    public async uninstallPWA() {
        localStorage.setItem('use-sw', 'false');
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
            registration.unregister();
        }
    }

    public async downloadLogs() {
        await this.settingsService.downloadLogs();
    }

    public async downloadBackup() {
        await this.settingsService.downloadBackup();
    }
}
