import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AwsService, ProfileNavService } from 'src/app/services';

@Component({
    selector: 'swt-home',
    templateUrl: './home.container.html',
    styleUrls: [ './home.container.scss' ]
})
export class HomeComponent implements OnDestroy {
    @ViewChild('video') video: ElementRef;
    isLoggedIn: boolean;
    serverStarted = false;
    subscriptions: Subscription[] = [];

    constructor(
        private profileService: ProfileNavService,
        private _aws: AwsService
    ) {
        this.subscriptions.push( this.profileService.isLoggedIn.pipe( distinctUntilChanged() ).subscribe( (loginStatus: boolean) => {
            this.isLoggedIn = loginStatus;
        }));
        this.subscriptions.push( this._aws.pvServerStarted$.subscribe( (started) => this.serverStarted = started));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }
}
