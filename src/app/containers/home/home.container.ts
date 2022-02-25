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
    subscriptions: Subscription[] = [];
    serverStarted: boolean;

    constructor(
        private _profileService: ProfileNavService,
        private _awsService: AwsService
    ) {
        this.subscriptions.push( this._profileService.isLoggedIn.pipe( distinctUntilChanged() ).subscribe( (loginStatus: boolean) => {
            this.isLoggedIn = loginStatus;
        }));
        this.subscriptions.push( this._awsService.pvServerStarted$.pipe( distinctUntilChanged() )
            .subscribe( ( status: boolean ) => this.serverStarted = status )
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }
}
