import { Component, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'swt-orientation-menu',
    templateUrl: './orientation-menu.component.html',
    styleUrls: [ '../menu.scss', './orientation-menu.component.scss' ]
})
export class OrientationMenuComponent implements OnDestroy {
    @Input() pvView: any;
    renderDebouncer: Subject<string> = new Subject<string>();
    subscriptions: Subscription[] = [];
    

    constructor() {
        // debounce render
        this.subscriptions.push(
            this.renderDebouncer.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                this.pvView.render();
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    snapTo( view: string ) {
        this.pvView.get().session.call( 'pv.h3lioviz.snap_to_view', [ view ] );
        this.renderDebouncer.next();
    }
}
