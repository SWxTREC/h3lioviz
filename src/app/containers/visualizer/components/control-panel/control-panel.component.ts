import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ConfigLabels, IControlPanel } from 'src/app/models';
import { SiteConfigService } from 'src/app/services';

@Component({
    selector: 'swt-control-panel',
    templateUrl: './control-panel.component.html',
    styleUrls: [ './control-panel.component.scss' ]
})
export class ControlPanelComponent implements OnDestroy, OnInit {
    @Input() pvView: any;
    expansionState: IControlPanel;

    constructor(
        private _siteConfigService: SiteConfigService
    ) {}

    ngOnInit(): void {
        this.expansionState = this._siteConfigService.getSiteConfig()[ ConfigLabels.cPanelExpansions ];
    }

    ngOnDestroy(): void {
        this._siteConfigService.updateSiteConfig( { [ConfigLabels.cPanelExpansions]: this.expansionState });
    }

}
