import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { IModelMetadata } from 'src/app/models';
import { environment, localUrls } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CatalogService {
    catalog$: BehaviorSubject<IModelMetadata[]> = new BehaviorSubject(undefined);

    constructor(
        private _http: HttpClient
    ) {
        // get catalog on app load
        this.getCatalog().subscribe( catalog => {
            // sort catalog by `rundate_cal`
            catalog.sort( ( a, b ) => moment(b['rundate_cal']).valueOf() - moment(a['rundate_cal']).valueOf() );
            this.catalog$.next(catalog);
        });
    }

    getCatalog(): Observable<any> {
        const catalogUrl = environment.production ? environment.aws.api + 'availableRuns' : localUrls.catalog;
        return this._http.get( catalogUrl );
    }
}
