import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, EMPTY, expand, map, Observable, scan, tap } from 'rxjs';
import { ICmeMetadata, IModelMetadata } from 'src/app/models';
import { environment, localUrls } from 'src/environments/environment';

// the max page size for AWS is 100
const MAX_PAGE_SIZE = 50;

interface ICatalogPage {
    data: IModelMetadata[];
    ['next_token']: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class CatalogService {
    private _http = inject(HttpClient);

    catalog$: BehaviorSubject<IModelMetadata[]> = new BehaviorSubject(undefined);
    runTitles: {};
    private _catalogUrl: string;

    formatCatalog(catalog: IModelMetadata[]) {
        catalog.map( (catalogEntry: IModelMetadata) => {
            catalogEntry.resolution = this._getResolution( catalogEntry.code );
            const hasConeMetadata = catalogEntry.cme_time;
            if ( hasConeMetadata ) {
                catalogEntry.cme_time = catalogEntry.cme_time.replace(/'/g, '').split(',').join('\n');
                catalogEntry.cme_cone_half_angle = catalogEntry.cme_cone_half_angle.replace('.,', '.0,').split(',')
                .map(value => {
                    return parseFloat(value).toFixed(0);
                }).join('\n');
                catalogEntry.cme_radial_velocity = catalogEntry.cme_radial_velocity.replace('.,', '.0,').split(',')
                .map(value => {
                    return parseFloat(value).toFixed(0);
                }).join('\n');
                catalogEntry.cme_latitude = catalogEntry.cme_latitude.replace('.,', '.0,').split(',')
                .map(value => {
                    return parseFloat(value).toFixed(0);
                }).join('\n');
                catalogEntry.cme_longitude = catalogEntry.cme_longitude.replace('.,', '.0,').split(',')
                .map(value => {
                    return parseFloat(value).toFixed(0);
                }).join('\n');
            }
            return catalogEntry;
        });
        return catalog;
    }

    formatCmeMetadataForHtml( run: IModelMetadata ): ICmeMetadata {
        if ( !run.cme_time ) {
            return null;
        }
        const cmeTime = run.cme_time.replace(/-/g, '\u2011').split('\n').join(', ');
        const cmeConeHalfAngle = run.cme_cone_half_angle.split('\n').join(', ');
        const cmeRadialVelocity = run.cme_radial_velocity.split('\n').join(', ');
        const cmeLatitude = run.cme_latitude.split('\n').join(', ');
        const cmeLongitude = run.cme_longitude.split('\n').join(', ');
        return {
            time: cmeTime,
            coneHalfAngle: cmeConeHalfAngle,
            radialVelocity: cmeRadialVelocity,
            latitude: cmeLatitude,
            longitude: cmeLongitude
        };
    }

    getCatalog(): Observable<any> {
        this._catalogUrl = environment.production ? environment.aws.api + 'availableRuns' : localUrls.catalog;

        if ( environment.production ) {
        // Page through availableRuns rather than pulling the whole catalog in
        // one response. Each page emits the runs accumulated so far, so the run
        // selector paints as soon as the first page lands instead of waiting on
        // every run. The API returns pages already sorted by `creation`
        // descending, so concatenating them preserves that order.

            return this._http.get<ICatalogPage>( this._getPageUrlWithToken() ).pipe(
                expand( page => page.next_token ? this._http.get<ICatalogPage>( this._getPageUrlWithToken( page.next_token ) ) : EMPTY ),
                map( page => ({
                    ...page,
                    data: this.formatCatalog( page.data )
                })),
                scan( ( runs: IModelMetadata[], page: ICatalogPage) => runs.concat( page.data ), [] ),
                tap( catalog => this._setCatalog( catalog ) )
            );
        } else {
            return this._http.get( this._catalogUrl );
        }
    }

    private _setCatalog(catalog: IModelMetadata[] = []): void {
        const sortedCatalog = [ ...catalog ].sort((a, b) =>
            moment(b['creation']).valueOf() - moment(a['creation']).valueOf()
            || Number(b['run_id']) - Number(a['run_id'])
        );

        this.catalog$.next(sortedCatalog);

        this.runTitles = sortedCatalog.reduce((aggregator, run) => {
            const time = moment.utc(run['creation']).format('YYYY-MM-DDTHH');
            aggregator[run['run_id']] = `${time} (${run.institute} #${run.run_id})`;
            return aggregator;
        }, {});
    }

    private _getPageUrlWithToken( token?: string ) {
        const params = `max_items=${MAX_PAGE_SIZE}`;
        // The token is base64 and always carries '=' padding, so it has to
        // be encoded to survive the query string.
        return token
                ? `${this._catalogUrl}?${params}&next_token=${encodeURIComponent( token )}`
                : `${this._catalogUrl}?${params}`;
    }

    private _getResolution( codeString: string ) {
        if (!codeString) {
            return;
        }

        const resolution = codeString.includes('low') ?
            'low' :
            codeString.includes('med') ?
            'med' :
            undefined;
        return resolution;
    }

}
