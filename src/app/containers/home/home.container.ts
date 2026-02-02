import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { LaspBaseAppSnippetsService } from 'lasp-base-app-snippets';
import { Subscription } from 'rxjs';

@Component({
    selector: 'swt-home',
    templateUrl: './home.container.html',
    styleUrls: [ './home.container.scss' ],
    standalone: false
})
export class HomeComponent implements OnDestroy {
    @ViewChild('video') video: ElementRef;
    subscriptions: Subscription[] = [];

    constructor(
        private _scripts: LaspBaseAppSnippetsService
    ) {
        this._scripts.misc.ignoreMaxPageWidth( this );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }
}
