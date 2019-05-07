import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'cdk-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

    constructor(private router: Router) {

    }

    ngOnInit() {
    }
}
