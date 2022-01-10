import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, of, Subscription } from 'rxjs';
import { catchError, sampleTime, startWith, switchMap, takeWhile, throttleTime } from 'rxjs/operators';
import { environment, environmentConfig } from 'src/environments/environment';

import { ProfileNavService } from '../profile-nav/profile-nav.service';

@Injectable({
    providedIn: 'root'
})
export class AwsService {
    awsUrl: string = environment.aws.api;
    loggedIn: boolean;
    serverStatus$: BehaviorSubject<string> = new BehaviorSubject('');
    ec2Subscription: Subscription;
    pvServerStarted$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private _http: HttpClient,
        private _profileService: ProfileNavService
    ) {
        console.log('aws service constructor starts up!')
        this._profileService.isLoggedIn.subscribe( loginStatus => {
            this.loggedIn = loginStatus;
            console.log({ loginStatus })
            if ( loginStatus ) {
                // once logged in, start checking the status of Paraview server
                this.monitorPvServer();
            }
        });

    }

    monitorPvServer() {
        interval(1000)
        .pipe(
            takeWhile( () => !this.pvServerStarted$.value ),
            startWith(0),
            // look for 200 status, but pass through fails with status: 0
            switchMap(() => this.getParaviewServerStatus().pipe( catchError( () => of({status: 0}) ))),
            switchMap( (pvStatus: {status: number}) => {
                console.log({ pvStatus })
                // returns when the PV server is NOT yet ready
                // stops the interval when PV server responds with 200 status
                const serverStatus = pvStatus.status;
                if ( serverStatus === 200 ) {
                    // good to connect!, trigger connection
                    this.pvServerStarted$.next(true);
                    // this.serverStatus$.next('started');
                    console.log('connect and cancel EC2 monitoring')
                    // unsubscribed to ec2 status monitoring
                    if ( this.ec2Subscription ) {
                        this.ec2Subscription.unsubscribe();
                    }
                    // stop interval
                    return of( false );
                } else {
                    // carry on logic and check the server status
                    return of( true );
                }
            })
        ).pipe( throttleTime( 1000 * 20 ) ).subscribe( pvNotReady => {
            console.log('slow loop checking EC2status')
            console.log({ pvNotReady });
            // if PV server is not ready, check the EC2 server status at a much slower rate
            this.ec2Subscription = this.getEc2Status().pipe(
                // take while not started, inclusive (take first started)
                takeWhile(() => this.serverStatus$.value !== 'started', true)
            )
                .subscribe( (ec2: { status: string, state: string}) => {
                    console.log({ ec2 })
                    const serverState: string = ec2.state;
                    const serverStatus: string = ec2.status;
                    const stopped: boolean = serverState === 'stopped' || serverState === 'terminated';
                    const stopping: boolean = serverState === 'stopping' || serverState === 'shutting-down';
                    const starting: boolean = serverState === 'pending' || serverStatus === 'initializing';
                    const started: boolean = serverState === 'running';
                    const status: string =
                        stopped ? 'stopped'
                        : stopping ? 'stopping'
                        : starting ? 'starting'
                        : started ? 'started'
                        : undefined;
                    this.serverStatus$.next( status );
                    console.log({ status })
                    if ( stopped ) {
                        // start it up!
                        this.startEc2().subscribe();
                        console.log('start it up and unsubscribe to status')
                        this.ec2Subscription.unsubscribe();
                    }
                });
        })
    }

    getEc2Status() {
        // CheckEC2Status.py lambda link
        // if dev, fake a response with a valid server state
        if (this.awsUrl === '#') {
            return of({ state: 'running', status: 'ok' });
        } else {
            return this._http.get(this.awsUrl + '/BrianTestStatusEC2');
        }
    }

    getParaviewServerStatus(): Observable<HttpResponse<string>> {
        return this._http.get( environmentConfig.pvServer, { responseType: 'text', observe: 'response' } )
    }

    startEc2() {
        this.serverStatus$.next('starting');
        // StartEC2Instances.py lambda link
        return this._http.get( this.awsUrl + '/BrianTestStartEC2', { responseType: 'text' });
    }
}
