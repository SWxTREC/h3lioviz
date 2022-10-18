import { Component, Input, OnDestroy } from '@angular/core';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ]
})
export class ControlPanelComponent implements OnDestroy {
    @Input() pvView: any;
    expansionState = {
        layers: false,
        contours: false,
        colors: false
    };

    constructor() {
        const storedExpansionState = JSON.parse( sessionStorage.getItem('expansions'));
        if ( storedExpansionState ) {
            this.expansionState = storedExpansionState;
        }
    }

    ngOnDestroy(): void {
        const expansionState = JSON.stringify( this.expansionState );
        sessionStorage.setItem('expansions', expansionState);
    }

}
