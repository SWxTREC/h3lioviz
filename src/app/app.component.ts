import { Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
    LaspBaseAppSnippetsService
} from 'lasp-base-app-snippets';
import {
    IImageLink,
    INavItem,
    ISocialLink,
    IVersion
} from 'lasp-footer';

import { environment } from '../environments/environment';

/** Entry Component */
@Component({
    selector: 'swt-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.scss' ]
})
export class AppComponent {

    // please have no more than 7 items in the nav menu
    navItems: INavItem[] = [
        {
            label: 'Visualizer',
            link: '/visualizer'
        }, {
            label: 'Documentation',
            link: '/docs'
        }
    ];

    orgLogos: IImageLink[] = [
        {
            src: 'https://swx-trec.com/swx-trec-assets/general/swx-trec-logo-white.png',
            href: 'https://swx-trec.com'
        }
    ];

    partnerLogos: IImageLink[] = [
        {
            href: 'https://lasp.colorado.edu',
            src: 'https://lasp.colorado.edu/media/projects/base-app/images/footer-lasp-logo.png'
        }
    ];

    socialLinks: ISocialLink[] = [
        {
            name: 'twitter',
            href: 'https://twitter.com/spaceweathercu'
        }, {
            name: 'github',
            href: 'https://github.com/SWxTREC'
        }
    ];

    versions: IVersion[] = [
        {
            link: 'https://colorado.edu/spaceweather',
            productName: 'SWx TREC',
            version: ''
        },
        {
            version: environment.version
        }
    ];

    constructor(
        private _domSanitizer: DomSanitizer,
        private _matIconRegistry: MatIconRegistry,
        private _snippets: LaspBaseAppSnippetsService
    ) {
        this._snippets.appComponent.all({ googleAnalyticsId: environment.googleAnalyticsId });

        this._matIconRegistry.addSvgIconSet( this._domSanitizer.bypassSecurityTrustResourceUrl('assets/chart/chart-icons.svg'));
    }
}
