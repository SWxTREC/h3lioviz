import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AwsService, ProfileNavService } from 'src/app/services';

@Component({
    selector: 'swt-server-status',
    templateUrl: './server-status.component.html',
    styleUrls: ['./server-status.component.scss']
})
export class ServerStatusComponent implements OnDestroy {
    isLoggedIn: boolean;
    serverStatus: string;
    subscriptions: Subscription[] = []
    serverStatusSubscription: Subscription;

    constructor(
        private profileService: ProfileNavService,
        private awsService: AwsService
    ) {
        this.subscriptions.push( this.profileService.isLoggedIn.pipe( distinctUntilChanged() ).subscribe( (loginStatus: boolean) => {
            this.isLoggedIn = loginStatus;
            if ( loginStatus ) {
                this.serverStatusSubscription = this.awsService.serverStatus$.pipe( distinctUntilChanged() ).subscribe( (status: string) => {
                    this.serverStatus = status;
                });
                this.subscriptions.push( this.serverStatusSubscription );
            } else {
                if ( this.serverStatusSubscription ) {
                    this.serverStatusSubscription.unsubscribe();
                }
            }
        }))
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }


}
