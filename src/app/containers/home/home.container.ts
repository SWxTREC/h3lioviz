import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
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
    timeInterval: Subscription;

    constructor(
        private profileService: ProfileNavService,
        private awsService: AwsService
    ) {
        this.profileService.isLoggedIn.subscribe( loginStatus => {
            this.isLoggedIn = loginStatus;
            if ( this.isLoggedIn ) {
                // when logged in, check for server status every 20 seconds
                this.timeInterval = interval(1000 * 20)
                    .pipe(
                      startWith(0),
                      switchMap(() => this.awsService.getEc2Status())
                  ).subscribe( ( ec2: { state: string, status: string} ) => {
                      console.log({ ec2 });
                      this.serverState = ec2.state;
                      this.serverStatus = ec2.status;
                  },
                      err => console.log('HTTP Error', err));
            } else {
                if (this.timeInterval) {
                    this.timeInterval.unsubscribe();
                }
            }
        });
    }

    ngOnDestroy() {
        if (this.timeInterval) {
            this.timeInterval.unsubscribe();
        }
    }
}
