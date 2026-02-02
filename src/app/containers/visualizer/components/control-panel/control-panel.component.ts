import { Component, inject, Input, OnInit } from '@angular/core';
import { ConfigLabels, IControlPanel } from 'src/app/models';
import { SiteConfigService } from 'src/app/services';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ],
    standalone: false
})
export class ControlPanelComponent implements OnInit {
    private _siteConfigService = inject(SiteConfigService);

    @Input() pvView: any;
    expansionState: IControlPanel;

    ngOnInit(): void {
        this.expansionState = this._siteConfigService.getSiteConfig()?.[ ConfigLabels.cPanelExpansions ];
    }

    updateConfig(): void {
        this._siteConfigService.updateSiteConfig( { [ConfigLabels.cPanelExpansions]: this.expansionState });
    }

}
