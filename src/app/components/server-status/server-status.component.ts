import { Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AwsService } from 'src/app/services';

@Component({
    selector: 'swt-server-status',
    templateUrl: './server-status.component.html',
    styleUrls: [ './server-status.component.scss' ],
    standalone: false
})
export class ServerStatusComponent implements OnDestroy {
    private _awsService = inject(AwsService);

    serverStarted: boolean;
    subscriptions: Subscription[] = [];

    constructor() {
        this.subscriptions.push( this._awsService.pvServerStarted$.pipe( distinctUntilChanged() )
            .subscribe( ( status: boolean ) => this.serverStarted = status )
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
