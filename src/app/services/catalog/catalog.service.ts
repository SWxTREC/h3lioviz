import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IModelMetadata } from 'src/app/models';
import { environment } from 'src/environments/environment';

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
        return this._http.get( environment.catalogUrl );
    }
}
