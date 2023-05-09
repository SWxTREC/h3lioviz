import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { assign } from 'lodash';
import { compressToEncodedURIComponent } from 'lz-string';
import { BehaviorSubject } from 'rxjs';
import { ParamsService, PlotsService } from 'scicharts';
import {
    DEFAULT_PLOT_OPTIONS
} from 'src/app/models';
import { ConfigLabels, DEFAULT_SITE_CONFIG, ISiteConfig } from 'src/app/models/site-config';

@Injectable({
    providedIn: 'root'
})
export class SiteConfigService {
    config$: BehaviorSubject<ISiteConfig> = new BehaviorSubject( DEFAULT_SITE_CONFIG );

    constructor(
        public location: Location,
        public router: Router,
        private _activatedRoute: ActivatedRoute,
        private _paramsService: ParamsService,
        private _plotsService: PlotsService
    ) {
        // update site config with plot changes
        this._plotsService.getPlots$().subscribe(() => {
            const changedParams = this._paramsService.getChangedPlotParams( DEFAULT_PLOT_OPTIONS );
            this.updateSiteConfig({plots: changedParams});
        });
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

    getParamsFromQueryOrStorage( siteConfigFromUrl: ISiteConfig, parameter: string ) {
        if (siteConfigFromUrl[ ConfigLabels[parameter]] ) {
            return siteConfigFromUrl[ ConfigLabels[parameter]];
        } else {
            return JSON.parse(sessionStorage.getItem(parameter));
        }
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
        // iterate through config keys and map to config labels with stringified content
        const jsonConfig = Object.keys( config ).reduce( (aggregator, key) => {
            if ( config[key] ) {
                aggregator[ ConfigLabels[key] ] = JSON.stringify( config[key] );
            }
            return aggregator;
        }, {});
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
    updateSiteConfig( updateParam: {}, updateUrl = true ): void {
        this.setSiteConfig( assign( {}, this.getSiteConfig(), updateParam ), updateUrl );
    }
}
