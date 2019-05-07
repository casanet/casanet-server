import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'cdk-sidemenu-item',
    templateUrl: './sidemenu-item.component.html',
    styleUrls: ['./sidemenu-item.component.scss']
})
export class SidemenuItemComponent implements OnInit {

    @Input() menu;
    @Input() iconOnly: boolean;
    @Input() secondaryMenu = false;

    currentUrl = '';
    userInfo: any;

    constructor(private router: Router,
        private authService: AuthService, ) {
        this.currentUrl = this.router.url;
        router.events.subscribe((_: NavigationEnd) => {
            this.currentUrl = this.router.url;
        });
    }

    ngOnInit() {
    }

    openLink() {
        this.menu.open = this.menu.open;
    }

    chechForChildMenu() {
        return (this.menu && this.menu.sub) ? true : false;
    }

}
