import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../../../../backend/src/models/sharedInterfaces';
import { Subscription } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'cdk-sidemenu-item',
    templateUrl: './sidemenu-item.component.html',
    styleUrls: ['./sidemenu-item.component.scss']
})
export class SidemenuItemComponent implements OnInit, OnDestroy {

    @Input() menu;
    @Input() iconOnly: boolean;
    @Input() secondaryMenu = false;

    currentUrl = '';
    userProfile: User = {} as unknown as User;
    userProfileSubscription: Subscription;

    constructor(private router: Router,
        private authService: AuthService) {

        this.currentUrl = this.router.url;
        router.events.subscribe((_: NavigationEnd) => {
            this.currentUrl = this.router.url;
        });

        this.userProfileSubscription =
            this.authService.userProfile.subscribe((userProfile) => {
                this.userProfile = userProfile;
            });
    }

    ngOnInit() {
    }

    openLink() {
        this.menu.open = this.menu.open;
    }

    ngOnDestroy(): void {
        this.userProfileSubscription.unsubscribe();
    }

    chechForChildMenu() {
        return (this.menu && this.menu.sub) ? true : false;
    }

}
