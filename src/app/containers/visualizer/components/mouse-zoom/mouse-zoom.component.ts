import { Component, inject, Input, OnChanges } from '@angular/core';
import { ConfigLabels } from 'src/app/models';
import { SiteConfigService } from 'src/app/services';

@Component({
    selector: 'swt-mouse-zoom',
    templateUrl: './mouse-zoom.component.html',
    styleUrls: [ './mouse-zoom.component.scss' ],
    standalone: false
})
export class MouseZoomComponent implements OnChanges {
    private _siteConfigService = inject(SiteConfigService);

    @Input() pvView: any;
    zoomState: 'on' | 'off';

    ngOnChanges() {
        // set zoom once pvView is defined
        if ( this.pvView ) {
            this.zoomState = this._siteConfigService.getSiteConfig()[ ConfigLabels.zoomState ];
            this.setZoom();
        }
    }

    setZoom() {
        this._siteConfigService.updateSiteConfig( {[ConfigLabels.zoomState]: this.zoomState} );
        if ( this.zoomState === 'on' && this.pvView ) {
            // turn it on
            this.pvView.setRpcWheelEvent( 'viewport.mouse.zoom.wheel' );
        } else {
            // turn it off
            this.pvView.setRpcWheelEvent( undefined );
        }
    }

    toggleZoom() {
        this.zoomState = this.zoomState === 'on' ? 'off' : 'on';
        this.setZoom();
    }
}
