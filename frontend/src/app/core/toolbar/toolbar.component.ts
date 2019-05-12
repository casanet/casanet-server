import { Component, OnInit, Input, OnDestroy } from '@angular/core';
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

	userProfile: User = {} as unknown as User;
	userProfileSubscription: Subscription;

	constructor(private settingsService: SettingsService,
		private authService: AuthService) {
		this.remoteConnectionSubscription =
			this.settingsService.remoteStatusFeed.subscribe((remoteConnection) => {
				this.remoteConnection = remoteConnection;
			});

		this.livelinessSubscription =
			this.settingsService.onlineFeed.subscribe((liveliness) => {
				this.liveliness = liveliness;
			});

		this.userProfileSubscription =
			this.authService.userProfile.subscribe((userProfile) => {
				this.userProfile = userProfile;
			});
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.remoteConnectionSubscription.unsubscribe();
		this.livelinessSubscription.unsubscribe();
		this.userProfileSubscription.unsubscribe();
	}
}
