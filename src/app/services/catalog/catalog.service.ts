import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { IModelMetadata } from 'src/app/models';
import { environment, localUrls } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CatalogService {
    catalog$: BehaviorSubject<IModelMetadata[]> = new BehaviorSubject(undefined);
    runTitles: {};

    constructor(
        private _http: HttpClient
    ) {
        // get catalog on app load
        this.getCatalog().subscribe( catalog => {
            // sort catalog by `rundate_cal`
            catalog.sort( ( a, b ) => moment(b['rundate_cal']).valueOf() - moment(a['rundate_cal']).valueOf() );
            const formattedCatalog = this._formatCatalog(catalog);
            this.catalog$.next(formattedCatalog);
            this.runTitles = Array.from(this.catalog$.value).reduce( (aggregator, run) => {
                const time = moment.utc( run['rundate_cal'] ).format('YYYY-MM-DDTHH');
                aggregator[ run['run_id'] ] = `${time} (${run.institute})`;
                return aggregator;
            }, {});
        });
    }

    private _formatCatalog(catalog: IModelMetadata[]) {
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

    getCatalog(): Observable<any> {
        const catalogUrl = environment.production ? environment.aws.api + 'availableRuns' : localUrls.catalog;
        return this._http.get( catalogUrl );
    }

    private _getResolution( codeString: string ) {
        const resolution = codeString.includes('low') ?
            'low' :
            codeString.includes('med') ?
            'med' :
            undefined;
        return resolution;
    }

}
