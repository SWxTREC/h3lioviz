import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, of, Subscription } from 'rxjs';
import { catchError, startWith, switchMap, takeWhile, throttleTime } from 'rxjs/operators';
import { environment, environmentConfig } from 'src/environments/environment';

import { ProfileNavService } from '../profile-nav/profile-nav.service';

@Injectable({
    providedIn: 'root'
})
export class AwsService {
    awsUrl: string = environment.aws.api;
    loggedIn: boolean;
    pvServerStarted$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    startEc2Subscription: Subscription;

    constructor(
        private _http: HttpClient,
        private _profileService: ProfileNavService
    ) {
        this._profileService.isLoggedIn.subscribe( loginStatus => {
            this.loggedIn = loginStatus;
            if ( loginStatus ) {
                // once logged in, start checking the status of Paraview server
                // for prod use monitor function, when running a local server, fake a connection
                if ( environment.production ) {
                    this.monitorPvServer();
                } else {
                    this.pvServerStarted$.next(true);
                }
            }
        });
    }

    monitorPvServer() {
        interval(1000)
        .pipe(
            takeWhile( () => this.loggedIn ),
            takeWhile( () => this.pvServerStarted$.value === false ),
            startWith(0),
            // look for 200 status, but pass through fails with status: 0
            switchMap(() => this.getParaviewServerStatus().pipe( catchError( () => of({ status: 0 }) ))),
            switchMap( (pvStatus: {status: number}) => {
                // returns when the PV server is NOT yet ready
                const serverStatus = pvStatus.status;
                if ( serverStatus === 200 ) {
                    // good to connect!
                    this.pvServerStarted$.next(true);
                    if ( this.startEc2Subscription ) {
                        this.startEc2Subscription.unsubscribe();
                    }
                    return of( false );
                } else {
                    // carry on
                    return of( true );
                }
            })
        ).pipe( throttleTime( 1000 * 20 ) ).subscribe( pvNotReady => {
            if ( pvNotReady === true ) {
                // remove existing subscriptions
                if ( this.startEc2Subscription ) {
                    this.startEc2Subscription.unsubscribe();
                }
                // send the start command every throttled interval until PV server returns 200
                this.startEc2Subscription = this.startEc2().subscribe();
            }
        });
    }

    getParaviewServerStatus(): Observable<HttpResponse<string>> {
        // remove '/paraview' from the sessionManagerURL to ping the server for 200 response
        const pvServerUrl: string = environmentConfig.sessionManagerURL.split('/').slice(0, -1).join('');
        return this._http.get( pvServerUrl, { responseType: 'text', observe: 'response' } );
    }

    startEc2(): Observable<string> {
        // StartEC2Instances.py lambda link
        return this._http.get( this.awsUrl + '/BrianTestStartEC2', { responseType: 'text' });
    }
}
