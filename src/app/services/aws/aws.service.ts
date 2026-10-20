import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, exhaustMap, map, startWith, switchMap, takeWhile } from 'rxjs/operators';
import { environment, environmentConfig } from 'src/environments/environment';

// Ready only when the launcher itself answers the readiness GET, which it does with an
// error since the probe has no session id: 400 from ParaView 5.x's wslink, 405 from the
// wslink 1.12 in the ParaView 6.x image (it routes GET only when WSLINK_LAUNCHER_GET is set).
// The proxies in front answer 5xx while the launcher is down or cannot spawn a session yet.
const LAUNCHER_READY_STATUSES = [ 400, 405 ];

export const isLauncherReadyStatus = ( status: number ): boolean => LAUNCHER_READY_STATUSES.includes( status );

@Injectable({
    providedIn: 'root'
})
export class AwsService {
    private _http = inject(HttpClient);

    awsUrl: string = environment.aws.api;
    pvServerStarted$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    monitoringInterval: Subscription;

    // Every request to start the instance goes through here. exhaustMap ignores
    // new emissions while one request is still in flight, so there is never more
    // than one concurrent /ec2start and none is ever cancelled part way through.
    // That replaces the old startEc2Subscription field, which had to serve as both
    // "the retry in flight" and a cleanup handle, and cancelled the initial request.
    private _startEc2Requests: Subject<void> = new Subject<void>();

    constructor() {
        // One subscription for the life of the service. catchError keeps a failed
        // request from completing the stream and silencing every later retry.
        this._startEc2Requests.pipe(
            exhaustMap( () => this.startEc2().pipe( catchError( () => of(null) ) ) )
        ).subscribe();

        // start up the service immediately on visualizer load
        // this should be the first network call
        this.startUp();
    }

    getEc2Status(): Observable<string> {
        return this._http.get( this.awsUrl + 'ec2status', { responseType: 'text' });
    }

    getParaviewServerStatus(): Observable<number> {
        // add a random query parameter to the request, the easiest way to keep the request from being cached in the browser
        return this._http.get(
            environmentConfig.sessionManagerURL + '?' + Math.random(),
            { responseType: 'text', observe: 'response' }
        ).pipe(
            map( ( response: HttpResponse<string> ) => response.status ),
            catchError( error => of( error?.status ?? 0 ) )
        );
    }

    monitorPvServer() {
        this.monitoringInterval = interval(1000)
        .pipe(
            takeWhile( () => this.pvServerStarted$.value === false ),
            startWith(0),
            // exhaustMap wraps the whole sequence: a new poll must not cancel an
            // in-flight launcher probe, which is the slow call during a cold boot.
            exhaustMap( () => this.getEc2Status().pipe(
                catchError( () => of('') ),
                switchMap( ( state: string ) => {
                    if ( state.includes('stopped') ) {
                        this._startEc2Requests.next();
                    }
                    // A stopping EC2 still answers the launcher, so asking it first
                    // would connect to a paraview container about to die.
                    if ( !state.includes('running') ) {
                        return of( false );
                    }
                    return this.getParaviewServerStatus().pipe(
                        map( status => isLauncherReadyStatus( status ) )
                    );
                })
            ))
        ).subscribe( ready => {
            if ( ready === true ) {
                this.pvServerStarted$.next(true);
            }
        });
    }

    startEc2(): Observable<string> {
        // StartEC2Instances.py lambda link.
        return this._http.get( this.awsUrl + 'ec2start', { responseType: 'text' });
    }

    startUp() {
        this.pvServerStarted$.next(false);
        // remove any existing monitoring interval
        this.monitoringInterval?.unsubscribe();
        // for prod use monitor function, when using a local server, fake a connection
        if ( environment.production) {
            // Start the instance immediately, before any polling.
            this._startEc2Requests.next();
            this.monitorPvServer();
        } else {
            this.pvServerStarted$.next(true);
        }
    }
}
