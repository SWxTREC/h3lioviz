import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, startWith, switchMap, takeWhile, throttleTime } from 'rxjs/operators';
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
<<<<<<< HEAD
    // how much to wait to connect to socket, allow for docker build when sending the start command
    socketDelay = 1000;
    monitoringInterval: Subscription;
=======
>>>>>>> origin/dev

    constructor(
        private _http: HttpClient,
        private _profileService: ProfileNavService
    ) {
        this._profileService.isLoggedIn.pipe( distinctUntilChanged() ).subscribe( loginStatus => {
            this.loggedIn = loginStatus;
        });
    }

    startUp() {
        // for prod use monitor function, when using a local server, fake a connection
        if ( environment.production) {
            // remove any existing monitoring interval
            this.monitoringInterval = undefined;
            this.monitorPvServer();
        } else {
            this.pvServerStarted$.next(true);
        }

    }

    monitorPvServer() {
        this.monitoringInterval = interval(1000)
        .pipe(
            takeWhile( () => this.loggedIn ),
            takeWhile( () => this.pvServerStarted$.value === false ),
            startWith(0),
            // pass through fails—looking specifically for a 500
            switchMap(() => this.getParaviewServerStatus().pipe(
                catchError( (error) => of(error) )
            )),
            switchMap( (pvStatus: {status: number}) => {
                // status is 0 when server is not ready, 500 when it is ready
                // a network error of 503 for stopping, 502 for starting, but those statuses are passed through as errror='unknown' and status=0
                if ( pvStatus.status === 500 ) {
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
                // send the start command every throttled interval until PV server returns a 500 status
                this.startEc2Subscription = this.startEc2().subscribe();
            }
        });
    }

    getParaviewServerStatus(): Observable<HttpResponse<string>> {
        // add a random query parameter to the request, the easiest way to keep the request from being cached in the browser
        return this._http.get( environmentConfig.sessionManagerURL + '?' + Math.random(), { responseType: 'text', observe: 'response' } );
    }

    startEc2(): Observable<string> {
        // StartEC2Instances.py lambda link
        return this._http.get( this.awsUrl + '/BrianTestStartEC2', { responseType: 'text' });
    }
}
