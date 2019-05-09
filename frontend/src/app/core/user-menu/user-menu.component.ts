import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MinionsService } from '../../services/minions.service';
import { DevicesService } from '../../services/devices.service';
import { TranslateService } from '../../translate.service';
import { User } from '../../../../../backend/src/models/sharedInterfaces';
import { TranslatePipe } from '../../translate.pipe';
import { OperationService } from '../../services/operations.service';
import { TimingsService } from '../../services/timings.service';

// import { LoadingService } from '../../services/loading/loading.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'cdk-user-menu',
	templateUrl: './user-menu.component.html',
	styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {
	isOpen = false;

	public profile: User;
	translatePipe: TranslatePipe;

	@Input() currentUser = null;
	@HostListener('document:click', ['$event', '$event.target'])
	onClick(event: MouseEvent, targetElement: HTMLElement) {
		if (!targetElement) {
			return;
		}

		const clickedInside = this.elementRef.nativeElement.contains(targetElement);
		if (!clickedInside) {
			this.isOpen = false;
		}
	}

	constructor(private elementRef: ElementRef,
		public snackBar: MatSnackBar,
		public dialog: MatDialog,
		private router: Router,
		private authService: AuthService,
		private minionsService: MinionsService,
		private devicesService: DevicesService,
		private operationService: OperationService,
		private timingsService: TimingsService,
		private translateService: TranslateService) {
		this.translatePipe = new TranslatePipe(this.translateService);

		authService.userProfile.subscribe((profile) => {
			this.profile = profile;
		});
	}


	ngOnInit() {
	}

	onLogout() {
		this.authService.logout().then(() => {

			this.minionsService.cleanUp();
			this.operationService.cleanUp();
			this.devicesService.cleanUp();
			this.timingsService.cleanUp();

			this.snackBar.open(this.translatePipe.transform('LOGOUT_SUCCESSFULLY'), this.translatePipe.transform('SUBMIT'), {
				duration: 20000,
			});
		}).catch((() => {
			this.snackBar.open(this.translatePipe.transform('LOGOUT_FAIL'), this.translatePipe.transform('SUBMIT'), {
				duration: 20000,
			});
		}).bind(this));
	}



	openHelpDialog(): void {
		const dialogConfig = new MatDialogConfig();

		// dialogConfig.disableClose = true;
		// dialogConfig.autoFocus = true;

		this.dialog.open(HelpDialogComponent, dialogConfig);
	}

	openAboutDialog(): void {
		const dialogConfig = new MatDialogConfig();

		// dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;

		this.dialog.open(AboutDialogComponent, dialogConfig);
	}

}
