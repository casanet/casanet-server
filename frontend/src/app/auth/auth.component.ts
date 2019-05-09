import { Component, OnInit, Input, OnChanges, AfterContentInit } from '@angular/core';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']

})

export class AuthComponent implements OnInit, OnChanges, AfterContentInit {
    @Input() isVisible = true;
    visibility = 'shown';

    sideNavOpened = true;
    matDrawerOpened = false;
    matDrawerShow = true;
    sideNavMode = 'side';

    ngOnChanges() {
        this.visibility = this.isVisible ? 'shown' : 'hidden';
    }

    constructor(private media: ObservableMedia) {

    }

    ngOnInit() {
        this.media.subscribe((mediaChange: MediaChange) => {
            this.toggleView();
        });
    }

    ngAfterContentInit() {
        /** Clear loader from DOM, to not let him work in background */
        document.getElementById('loading-app-assets').innerHTML = '';
    }

    getRouteAnimation(outlet) {


        return outlet.activatedRouteData.animation;
        // return outlet.isActivated ? outlet.activatedRoute : ''
    }

    toggleView() {
        if (this.media.isActive('gt-md')) {
            this.sideNavMode = 'side';
            this.sideNavOpened = true;
            this.matDrawerOpened = false;
            this.matDrawerShow = true;
        } else if (this.media.isActive('gt-xs')) {
            this.sideNavMode = 'side';
            this.sideNavOpened = false;
            this.matDrawerOpened = true;
            this.matDrawerShow = true;
        } else if (this.media.isActive('lt-sm')) {
            this.sideNavMode = 'over';
            this.sideNavOpened = false;
            this.matDrawerOpened = false;
            this.matDrawerShow = false;
        }
    }


}
