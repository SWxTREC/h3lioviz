import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AwsService } from 'src/app/services';

@Component({
    selector: 'swt-server-status',
    templateUrl: './server-status.component.html',
    styleUrls: [ './server-status.component.scss' ]
})
export class ServerStatusComponent implements OnDestroy {
    serverStarted: boolean;
    subscriptions: Subscription[] = [];

    constructor(
        private awsService: AwsService
    ) {
        this.subscriptions.push( this.awsService.pvServerStarted$.pipe( distinctUntilChanged() )
            .subscribe( ( status: boolean ) => this.serverStarted = status )
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
