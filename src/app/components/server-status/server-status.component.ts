import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AwsService, ProfileNavService } from 'src/app/services';

@Component({
    selector: 'swt-server-status',
    templateUrl: './server-status.component.html',
    styleUrls: [ './server-status.component.scss' ]
})
export class ServerStatusComponent implements OnDestroy {
    isLoggedIn: boolean;
    serverStarted: boolean;
    subscriptions: Subscription[] = [];
    serverStartedSubscription: Subscription;

    constructor(
        private profileService: ProfileNavService,
        private awsService: AwsService
    ) {
        this.subscriptions.push( this.profileService.isLoggedIn.pipe( distinctUntilChanged() )
        .subscribe( (loginStatus: boolean) => {
            this.isLoggedIn = loginStatus;
            if ( loginStatus ) {
                this.serverStartedSubscription = this.awsService.pvServerStarted$.pipe( distinctUntilChanged() )
                .subscribe( ( status: boolean ) => {
                    this.serverStarted = status;
                });
                this.subscriptions.push( this.serverStartedSubscription );
            } else {
                if ( this.serverStartedSubscription ) {
                    this.serverStartedSubscription.unsubscribe();
                }
            }
        }));
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
