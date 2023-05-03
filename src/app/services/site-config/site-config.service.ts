import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { assign } from 'lodash';
import { compressToEncodedURIComponent } from 'lz-string';
import { BehaviorSubject } from 'rxjs';
import { ConfigLabels, ISiteConfig } from 'src/app/models/site-config';

@Injectable({
    providedIn: 'root'
})
export class SiteConfigService {
    config$: BehaviorSubject<ISiteConfig>;

    constructor(
        public location: Location,
        public router: Router,
        private _activatedRoute: ActivatedRoute
    ) {
        this.config$ = new BehaviorSubject({});
    }

    /** return the site config */
    getSiteConfig(): ISiteConfig {
        return this.config$.getValue();
    }

    /** returns a compressed string of the current site config */
    getCompressedSiteConfig(config: ISiteConfig) {
        const jsonConfig = this.parseConfigToJson(config);
        return compressToEncodedURIComponent(JSON.stringify(jsonConfig));
    }

    /** given the current config, update the URL to shadow the config values */
    navigateToNewUrl() {
        const compressedConfig = this.getCompressedSiteConfig(this.getSiteConfig());
        const jsonConfig = {lz: compressedConfig};
        const url = this.router.serializeUrl(
            this.router.createUrlTree([], {
                relativeTo: this._activatedRoute,
                queryParams: jsonConfig
            })
        );
        this.location.replaceState(url);
    }

    /** stringify objects for session storage and use in the url */
    parseConfigToJson( config: ISiteConfig ) {
        const jsonConfig: any = {};
        if ( config.plots ) {
            jsonConfig[ ConfigLabels.plotParams ] = JSON.stringify( config.plots );
        }
        if ( config.globalOptions ) {
            jsonConfig[ ConfigLabels.globalOptionsParams ] = JSON.stringify( config.globalOptions );
        }
        if ( config.globalRanges ) {
            jsonConfig[ ConfigLabels.rangeParams ] = JSON.stringify( config.globalRanges );
        }
        return jsonConfig;
    }

    /** set the site config. Update the session storage and the URL with the new config */
    setSiteConfig( newConfig: ISiteConfig, updateUrl = true ): void {
        const jsonConfig: Object = this.parseConfigToJson( newConfig );
        // save our new config to session storage
        for ( const key in jsonConfig ) {
            if ( jsonConfig.hasOwnProperty( key ) ) {
                sessionStorage.setItem( key, jsonConfig[ key ] );
            }
        }

        // alert components of changes to the site config
        this.config$.next( newConfig );
        if (updateUrl) {
            this.navigateToNewUrl();
        }

    }

    /** given an update param ( e.g. { paramName: value } ) merge new value with current config */
    private _updateSiteConfig( updateParam: {}, updateUrl = true ): void {
        this.setSiteConfig( assign( {}, this.getSiteConfig(), updateParam ), updateUrl );
    }
}
