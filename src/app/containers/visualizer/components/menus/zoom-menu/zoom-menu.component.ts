import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'swt-zoom-menu',
    templateUrl: './zoom-menu.component.html',
    styleUrls: [ '../menu.scss',  './zoom-menu.component.scss' ]
})
export class ZoomMenuComponent implements OnChanges {
    @Input() pvView: any;
    zoomState: boolean;

    constructor() {
        const storedZoomState = JSON.parse(sessionStorage.getItem('zoomState'));
        this.zoomState = storedZoomState;
    }

    ngOnChanges() {
        // set zoom pvView is defined
        if ( this.pvView ) {
            this.setZoom();
        }
    }

    resetZoom() {
        this.pvView.get().viewStream.resetCamera();
    }
    
    setZoom() {
        sessionStorage.setItem('zoomState', JSON.stringify(this.zoomState) );
        if ( this.zoomState && this.pvView ) {
            // turn it on
            this.pvView.setRpcWheelEvent( 'viewport.mouse.zoom.wheel' );
        } else {
            // turn it off
            this.pvView.setRpcWheelEvent( undefined );
        }
    }

    toggleZoom() {
        this.zoomState = !this.zoomState;
        this.setZoom();
    }
}
