import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { LaspBaseAppSnippetsService } from 'lasp-base-app-snippets';
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
        public profileService: ProfileNavService,
        private _scripts: LaspBaseAppSnippetsService
    ) {
        this._scripts.misc.ignoreMaxPageWidth( this );
        this.subscriptions.push( this.profileService.isLoggedIn.subscribe( (loginStatus: boolean) => {
            this.isLoggedIn = true;
            // this.isLoggedIn = loginStatus;
        }));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }
}
