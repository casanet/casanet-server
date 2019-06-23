import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {
	Minion,
	SwitchOptions,
	Toggle,
	MinionStatus,
	DeviceKind,
	ColorLight,
} from '../../../../../backend/src/models/sharedInterfaces';
import { MinionsService } from '../../services/minions.service';
import { DevicesService } from '../../services/devices.service';
import { DeepCopy } from '../../../../../backend/src/utilities/deepCopy';
import swal, { SweetAlertResult } from 'sweetalert2';
import { TranslateService } from '../../translate.service';
import { TranslatePipe } from '../../translate.pipe';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AutoTimeoutDialogComponent } from '../../dialogs/auto-timeout-dialog/auto-timeout-dialog.component';
import { CreateMinionDialogComponent } from '../../dialogs/create-minion-dialog/create-minion-dialog.component';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-dashboard-crm',
	templateUrl: './minions.component.html',
	styleUrls: ['./minions.component.scss']
})
export class MinionsComponent implements OnInit, OnDestroy {

	/** Mark to show or not loading animation */
	public dataLoading = true;

	public minions: Minion[] = [];

	private translatePipe: TranslatePipe;
	private minionSubscription: Subscription;

	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		public dialog: MatDialog,
		private translateService: TranslateService,
		private minionsService: MinionsService,
		private devicesService: DevicesService
	) {
		this.translatePipe = new TranslatePipe(this.translateService);

	}

	ngOnInit() {
		this.minionSubscription =
			this.minionsService.minionsFeed.subscribe((minions) => {
				this.dataLoading = false;

				/** Remove deleted minions */
				this.minions = this.minions.filter((oldMinion) => {
					for (const minion of minions) {
						if (minion.minionId === oldMinion.minionId) {
							return true;
						}
					}
					return false;
				});

				/** Create the new minions and update the exists  */
				for (const minion of minions) {

					/** If minion dont have status properties, ignore it  */
					if (!minion.minionStatus[minion.minionType]) {
						continue;
					}

					const existMinion = this.getExistMinion(minion.minionId);
					if (!existMinion) {
						// create update set.
						this.createUpdateSet(minion);
						this.minions.push(minion);
						continue;
					}

					/** Set all possible changes to current minion properties */
					existMinion.isProperlyCommunicated = minion.isProperlyCommunicated;
					existMinion.name = minion.name;
					existMinion.minionAutoTurnOffMS = minion.minionAutoTurnOffMS;
					existMinion.device = minion.device;
					existMinion.minionStatus = minion.minionStatus;
					this.createUpdateSet(existMinion);
				}

				this.minions.sort((m1: Minion, m2: Minion) => {
					/** If type is the same, sort by display name */
					if (m1.minionType === m2.minionType) {
						return m1.name < m2.name ? -1 : 1;
					}
					return m1.minionType < m2.minionType ? -1 : 1;
				});

				this.changeDetectorRef.detectChanges();
			});
	}

	ngOnDestroy(): void {
		this.minionSubscription.unsubscribe();
	}
	private getExistMinion(minionId: string): Minion {
		for (const existMinion of this.minions) {
			if (minionId === existMinion.minionId) {
				return existMinion;
			}
		}
	}

	public createUpdateSet(minion: Minion) {
		minion['updateSet'] = DeepCopy<MinionStatus>(minion.minionStatus);
	}

	public getMinionOnOffStatus(minion: Minion, minionStatus: MinionStatus): SwitchOptions {
		const minionSwitchStatus = minionStatus[minion.minionType] as Toggle;
		return minionSwitchStatus.status;
	}

	public isMinionRecordble(minion: Minion): boolean {
		for (const deviceKind of this.devicesService.devicesKinds) {
			if (deviceKind.brand === minion.device.brand && deviceKind.model === minion.device.model) {
				return deviceKind.isRecordingSupported;
			}
		}
	}

	public getMinionColor(minion: Minion): { dark: string; light: string } {
		const switchStatus = this.getMinionOnOffStatus(minion, minion['updateSet']);

		if (minion.minionType !== 'toggle' && (!switchStatus || switchStatus !== 'on')) {
			return {
				light: '#494a4c',
				dark: '#8c8f93'
			};
		}

		switch (minion.minionType) {
			case 'toggle':
				return {
					light: '#42A5F5',
					dark: '#64B5F6'
				};
			case 'switch':
				return {
					light: '#26A69A',
					dark: '#4DB6AC'
				};
			case 'roller':
				return {
					light: '#bf9f73',
					dark: '#bf9f73'
				};
			case 'cleaner':
				return {
					light: '#4c5d73',
					dark: '#4c5d73'
				};
			case 'airConditioning':
				return {
					light: '#5C6BC0',
					dark: '#7986CB'
				};
			case 'light':
				return {
					light: '#66BB6A',
					dark: '#81C784'
				};
			case 'temperatureLight':
				return {
					light: '#66BB6A',
					dark: '#81C784'
				};
			case 'colorLight':
				return {
					light: '#66BB6A',
					dark: '#81C784'
				};
		}
	}

	public async toggleStatus(minion: Minion) {
		if (minion['other_keyup'] || minion['sync'] || minion.minionType === 'toggle') {
			return;
		}

		const minionStatus = minion['updateSet'][minion.minionType];
		/** For record mode, copy to updat set too */
		minion['updateSet'][minion.minionType].status = minionStatus.status === 'on' ? 'off' : 'on';

		await this.setStatus(minion, minion['updateSet']);
	}

	public async setOnOffStatus(minion: Minion, setStatus: SwitchOptions) {
		minion.minionStatus[minion.minionType].status = setStatus;

		await this.setStatus(minion, minion.minionStatus);
	}

	public async renameMinion(minion: Minion) {

		const swalResult: void | SweetAlertResult = await swal({
			title: `${this.translatePipe.transform('SET_A_NEW_NAME')}`,
			text: `${this.translatePipe.transform('CURRENT_NAME')}: ${minion.name}`,
			input: 'text',
			showConfirmButton: true,
			showCancelButton: true,
			confirmButtonText: this.translatePipe.transform('SUBMIT'),
			cancelButtonText: this.translatePipe.transform('CANCEL')
		});

		// Case user select 'cancel' cancel the delete.
		if (swalResult && swalResult.dismiss) {
			return;
		}

		minion['sync'] = true;

		await this.minionsService.renameMinion(minion, swalResult.value);

		minion['sync'] = false;
	}
	public async setStatus(minion: Minion, setStatus: MinionStatus) {
		if (minion['recordMode']) {
			return;
		}

		minion.minionStatus = setStatus;

		minion['sync'] = true;
		await this.minionsService.setStatus(minion);
		minion['sync'] = false;
	}

	public async recordCommand(minion: Minion) {
		minion['recording'] = true;

		await this.minionsService.recordCommand(minion, minion['updateSet']);

		minion['recording'] = false;
	}

	public async generateToggleCommands(minion: Minion) {
		minion['recording'] = true;

		await this.minionsService.generateCommand(minion, { toggle: { status: 'on' } });
		await this.minionsService.generateCommand(minion, { toggle: { status: 'off' } });

		minion['recording'] = false;
	}

	public async generateRollerCommands(minion: Minion) {
		minion['recording'] = true;

		await this.minionsService.generateCommand(minion, { roller: { status: 'on', direction: 'up' } });
		await this.minionsService.generateCommand(minion, { roller: { status: 'on', direction: 'down' } });
		await this.minionsService.generateCommand(minion, { roller: { status: 'off', direction: 'down' } });

		minion['recording'] = false;
	}

	public async showDeviceInfo(minion: Minion) {
		const swalResult: void | SweetAlertResult = await swal({
			type: 'info',
			title: minion.name,
			html:
				`<table border="1" style="margin: auto">
					<tr><td><b>${this.translatePipe.transform('INNER_ID')}</b>     </td><td> ${minion.minionId} </td></tr>
					<tr><td><b>${this.translatePipe.transform('MODEL')}</b>        </td><td> ${minion.device.brand} </td></tr>
					<tr><td><b>${this.translatePipe.transform('BRAND')}</b>        </td><td> ${minion.device.model} </td></tr>
					<tr><td><b>${this.translatePipe.transform('DEVICE_NAME')}</b>  </td><td> ${minion.device.pysicalDevice.name || '?'} </td></tr>
					<tr><td><b>${this.translatePipe.transform('DEVICE_MAC')}</b>   </td><td> ${minion.device.pysicalDevice.mac} </td></tr>
					<tr><td><b>${this.translatePipe.transform('DEVICE_IP')}</b>    </td><td> ${minion.device.pysicalDevice.ip || '?'}</td></tr>
					<tr><td><b>${this.translatePipe.transform('DEVICE_VENDOR')}</b></td><td> ${minion.device.pysicalDevice.vendor || '?'} </td></tr>
				</table>`,
			confirmButtonText: this.translatePipe.transform('CLOSE'),
		});
	}

	public async refreshMinion(minion: Minion) {
		minion['sync'] = true;

		await this.minionsService.refreshMinion(minion);

		minion['sync'] = false;
	}

	public async resendLastStatusUpdate(minion: Minion) {
		minion['sync'] = true;

		await this.minionsService.setStatus(minion);

		minion['sync'] = false;
	}

	public recordModePressed(minion: Minion) {
		if (minion['recordMode']) {
			minion['recordMode'] = undefined;
			this.createUpdateSet(minion);
			return;
		}

		minion['recordMode'] = true;
	}

	public async deleteMinion(minion: Minion) {
		const swalResult: void | SweetAlertResult = await swal({
			type: 'warning',
			title: `${this.translatePipe.transform('SURE')}?`,
			text: `${this.translatePipe.transform('BEFORE_DELETE_MESSAGE')} ${minion.name} ?`,
			showConfirmButton: true,
			confirmButtonColor: 'red',
			showCancelButton: true,
			confirmButtonText: this.translatePipe.transform('DELETE'),
			cancelButtonText: this.translatePipe.transform('CANCEL')
		});

		// Case user select 'cancel' cancel the delete.
		if (swalResult && swalResult.dismiss) {
			return;
		}

		minion['sync'] = true;

		try {
			await this.minionsService.deleteMinion(minion);
			this.minions.splice(this.minions.indexOf(minion), 1);
		} catch (error) {

		}
	}

	public async createMinion() {
		this.dialog.open(CreateMinionDialogComponent, {
			data: {}
		});
	}

	public async editAutoTimeout(minion: Minion) {
		this.dialog.open(AutoTimeoutDialogComponent, {
			data: minion
		});
	}

	public async refreshMinions() {
		this.minions = [];
		this.dataLoading = true;

		await this.minionsService.refreshMinions();
	}

	public async reScanNetwordAndRefreshMinions() {
		this.minions = [];
		this.dataLoading = true;

		await this.devicesService.rescanLanDevices();
		await this.refreshMinions();
	}

	public loadChangeColor(colorLight: ColorLight, setRgbHexColor: string) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(setRgbHexColor);
		colorLight.red = Math.floor(parseInt(result[1], 16)) as number;
		colorLight.green = Math.floor(parseInt(result[2], 16)) as number;
		colorLight.blue = Math.floor(parseInt(result[3], 16)) as number;
	}

	private componentToHex(c: number) {
		const hex = c.toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	}

	public rgbToHex(colorLight: ColorLight) {
		return (
			'#' +
			this.componentToHex(colorLight.red) +
			this.componentToHex(colorLight.green) +
			this.componentToHex(colorLight.blue)
		);
	}

	public async refreshData() {
		this.dataLoading = true;
		await this.minionsService.refreshData();
		this.dataLoading = false;
	}
}
