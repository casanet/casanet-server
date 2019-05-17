import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ToolbarHelpers } from './toolbar.helpers';
import { SettingsService } from '../../services/settings.service';
import { RemoteConnectionStatus, User } from '../../../../../backend/src/models/sharedInterfaces';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'cdk-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.scss']
})

export class ToolbarComponent implements OnInit, OnDestroy {

	@Input() sidenav;
	@Input() sidebar;
	@Input() drawer;
	@Input() matDrawerShow;

	searchOpen = false;
	toolbarHelpers = ToolbarHelpers;

	remoteConnection: RemoteConnectionStatus;
	remoteConnectionSubscription: Subscription;

	liveliness: boolean;
	livelinessSubscription: Subscription;

	clock = '--:--:--';

	constructor(
		private changeDetectorRef: ChangeDetectorRef,
		private settingsService: SettingsService,
		private authService: AuthService) {
		this.remoteConnectionSubscription =
			this.settingsService.remoteStatusFeed.subscribe((remoteConnection) => {
				this.remoteConnection = remoteConnection;
				this.changeDetectorRef.detectChanges();
			});

		this.livelinessSubscription =
			this.settingsService.onlineFeed.subscribe((liveliness) => {
				this.liveliness = liveliness;
				this.changeDetectorRef.detectChanges();
			});

		this.clockActivation();
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.remoteConnectionSubscription.unsubscribe();
		this.livelinessSubscription.unsubscribe();
	}

	private clockActivation() {
		setInterval(() => {
			this.clock = new Date().toLocaleTimeString();
		}, 1000);
	}
}
