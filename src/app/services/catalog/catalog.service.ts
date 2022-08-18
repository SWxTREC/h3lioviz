import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IModelMetadata } from 'src/app/models';

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
        const baseUrl = window.location.origin as string;
        return this._http.get(baseUrl + '/assets/catalog/runs.json');
    }
}
