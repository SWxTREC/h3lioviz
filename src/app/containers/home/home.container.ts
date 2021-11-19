import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AwsService, ProfileNavService } from 'src/app/services';

@Component({
    selector: 'lasp-home',
    templateUrl: './home.container.html',
    styleUrls: [ './home.container.scss' ]
})
export class HomeComponent implements OnDestroy {
    @ViewChild('video') video: ElementRef;
    isLoggedIn: boolean;
    serverState: string;
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
                this.serverStatusSubscription = this.awsService.serverStatus$.subscribe( (ec2: { status: string, state: string}) => {
                    this.serverState = ec2.state;
                    this.serverStatus = ec2.status
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
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }
}
