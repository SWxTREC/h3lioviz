import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProfileNavService } from 'src/app/services';

@Component({
    selector: 'swt-home',
    templateUrl: './home.container.html',
    styleUrls: [ './home.container.scss' ]
})
export class HomeComponent implements OnDestroy {
    @ViewChild('video') video: ElementRef;
    isLoggedIn: boolean;
    subscriptions: Subscription[] = [];

    constructor(
        private _profileService: ProfileNavService,
    ) {
        this.subscriptions.push( this._profileService.isLoggedIn.subscribe( (loginStatus: boolean) => {
            this.isLoggedIn = loginStatus;
        }));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }
}
