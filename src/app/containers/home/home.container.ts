import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
        private _awsService: AwsService,
        private _profileService: ProfileNavService,
        private _router: Router
    ) {
        this.subscriptions.push( this._profileService.isLoggedIn.pipe( distinctUntilChanged() ).subscribe( (loginStatus: boolean) => {
            this.isLoggedIn = loginStatus;
        }));
        this.subscriptions.push( this._awsService.pvServerStarted$.subscribe( ( status: boolean ) => {
            this.serverStarted = status;
        }));
    }

    reloadVisualizer() {
        // navigate to visualizer then force reload, 'true' argument is for Firefox
        this._router.navigate([ '/visualizer' ]).then( () => window.location.reload(true) )
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }
}
