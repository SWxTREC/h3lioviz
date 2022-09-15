import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
            this.catalog$.next(catalog);
        });
    }

    getCatalog(): Observable<any> {
        const catalogUrl = environment.production ? environment.aws.api + 'availableRuns' : localUrls.catalog;
        return this._http.get( catalogUrl );
    }
}
