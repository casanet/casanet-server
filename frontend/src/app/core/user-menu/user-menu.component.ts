import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { HelpDialogComponent } from '../help-dialog/help-dialog.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { TranslateService } from '../../translate.service';

// import { LoadingService } from '../../services/loading/loading.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'cdk-user-menu',
	templateUrl: './user-menu.component.html',
	styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {
	isOpen = false;


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

	// userInfo: User;

	constructor(private translate: TranslateService,
		private elementRef: ElementRef,
		public snackBar: MatSnackBar,
		public dialog: MatDialog,
		private router: Router,
		private authService: AuthService) {
		// this.userInfo = authService.defaultUser;

		// authService.userInfoObserveable.subscribe((userInfo: User) => {
		// 	this.userInfo = userInfo;
		// });
	}


	ngOnInit() {
	}

	onLogout() {
		// this.loadingService.startLoading('מתנתק...');
		this.authService.logout().then(() => {
			this.snackBar.open('התנתקות בוצעה בהצלחה', 'אישור', {
				duration: 20000,
			});
		}).catch((() => {
			// this.loadingService.stopLoading();
			this.snackBar.open('ההתנתקות לא הושלמה!', 'אישור', {
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
