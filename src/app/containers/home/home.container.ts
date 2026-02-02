import { Component, ElementRef, inject, OnDestroy, ViewChild } from '@angular/core';
import { LaspBaseAppSnippetsService } from 'lasp-base-app-snippets';
import { Subscription } from 'rxjs';

@Component({
    selector: 'swt-home',
    templateUrl: './home.container.html',
    styleUrls: [ './home.container.scss' ],
    standalone: false
})
export class HomeComponent implements OnDestroy {
    private _scripts = inject(LaspBaseAppSnippetsService);

    @ViewChild('video') video: ElementRef;
    subscriptions: Subscription[] = [];

    constructor() {
        this._scripts.misc.ignoreMaxPageWidth( this );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }
}
