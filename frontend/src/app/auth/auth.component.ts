import { Component, OnInit, Input, OnChanges, AfterContentInit, OnDestroy } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { TimingsService } from '../services/timings.service';
import { Subscription } from 'rxjs';
import swal, { SweetAlertResult } from 'sweetalert2';
import { TranslateService } from '../translate.service';
import { TranslatePipe } from '../translate.pipe';
import { MinionsService } from '../services/minions.service';
import { OperationService } from '../services/operations.service';
import { Minion } from '../../../../backend/src/models/sharedInterfaces';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']

})

export class AuthComponent implements OnInit, OnChanges, AfterContentInit, OnDestroy {

    private translatePipe: TranslatePipe;

    @Input() isVisible = true;
    visibility = 'shown';

    sideNavOpened = true;
    matDrawerOpened = false;
    matDrawerShow = true;
    sideNavMode = 'side';

    activatedTimingSubscription: Subscription;
    ngOnChanges() {
        this.visibility = this.isVisible ? 'shown' : 'hidden';
    }

    constructor(
        private media: MediaObserver,
        private timingService: TimingsService,
        private minionsService: MinionsService,
        private operationService: OperationService,
        private translateService: TranslateService) {

        this.translatePipe = new TranslatePipe(this.translateService);
    }

    ngOnInit() {
        this.media.media$.subscribe((mediaChange: MediaChange) => {
            this.toggleView();
        });

        this.activatedTimingSubscription =
            this.timingService.timingActivatedFeed.subscribe(async (activateResult) => {
                if (!activateResult) {
                    return;
                }

                const { timing, results } = activateResult;

                let operation = this.operationService.getOperation(timing.triggerOperationId);

                if (!operation) {
                    /** If operation not exist (?) generate fake. */
                    operation = {
                        activities: [],
                        operationId: '--',
                        operationName: '--'
                    };
                }

                let errorMessages = '<br>';
                for (const failActivity of results) {
                    const errorMessage = this.translatePipe.transform(failActivity.error.responseCode, true);

                    let minion = this.minionsService.getMinion(failActivity.minionId);

                    if (!minion) {
                        minion = {
                            name: '--',
                        } as unknown as Minion;
                    }

                    // tslint:disable-next-line:max-line-length
                    errorMessages += `<br>${this.translatePipe.transform('SET')} ${minion.name} ${this.translatePipe.transform('FAIL')}, ${errorMessage}`;
                }

                await swal({
                    type: results.length < 1
                        ? 'success'
                        : 'warning',
                    title: `${timing.timingName} ${this.translatePipe.transform('ACTIVATED')}`,
                    html: `<b>${this.translatePipe.transform('ACTIVATED_OPERATION')}: ${operation.operationName}</b>${errorMessages}`,
                    timer: 60 * 1000,
                    showConfirmButton: true,
                    showCancelButton: false,
                    confirmButtonText: this.translatePipe.transform('OK')
                });

            });

        setTimeout(() => { this.domainsAlert(); }, 5000);
    }

    private async domainsAlert() {

        if (document.baseURI.includes(environment.dashboardDomain)) {
            return;
        }

        const msg = `
		${this.translatePipe.transform('go to correct domain')}
		<br>
		<a target="_blank" href="${environment.dashboardDomain}">${environment.dashboardDomain}</a>
		`;


        const swalResult: void | SweetAlertResult = await swal({
            type: 'warning',
            html: msg,
            showConfirmButton: true,
            showCancelButton: false,
            confirmButtonText: this.translatePipe.transform('OK'),
        });
    }
    
    ngAfterContentInit() {
        /** Clear loader from DOM, to not let it work in background */
        document.getElementById('loading-app-assets').innerHTML = '';
    }

    ngOnDestroy(): void {
        this.activatedTimingSubscription.unsubscribe();

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
