import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { startWith, switchMap, takeWhile } from 'rxjs/operators';
import { environment, environmentConfig } from 'src/environments/environment';

import { ProfileNavService } from '../profile-nav/profile-nav.service';

@Injectable({
    providedIn: 'root'
})
export class AwsService {
    awsUrl: string = environment.aws.api;
    loggedIn: boolean;
    serverStatus$: BehaviorSubject<string> = new BehaviorSubject('');
    monitorEc2: Subscription;
    monitorPvServer: Observable<HttpResponse<string>>;

    constructor(
        private _http: HttpClient,
        private _profileService: ProfileNavService
    ) {
        this._profileService.isLoggedIn.subscribe( loginStatus => {
            this.loggedIn = loginStatus;
            if ( loginStatus ) {
                // once logged in, start the EC2 service here
                // don't send the start command unless the server is stopped or undefined
                if ( this.serverStatus$.value === 'stopped' || this.serverStatus$.value === '' ) {
                    this.startEc2().subscribe();
                }
            } else {
                if ( this.monitorEc2 ) {
                    this.monitorEc2.unsubscribe();
                }
            }
        });

        // subscription to check EC2 server status every 20 seconds
        // monitors the server until it is 'ready' and then switches to monitoring the Paraview server
        this.monitorEc2 = interval(1000 * 20)
        .pipe(
            takeWhile( () => this.serverStatus$.value !== 'started'),
            startWith(0),
            switchMap(() => this.getEc2Status())
        ).subscribe( (ec2: { status: string, state: string}) => {
            const serverState: string = ec2.state;
            const serverStatus: string = ec2.status;
            const stopped: boolean = serverState === 'stopped' || serverState === 'terminated';
            const stopping: boolean = serverState === 'stopping' || serverState === 'shutting-down';
            const starting: boolean = serverState === 'pending' || serverStatus === 'initializing';
            const ready: boolean = serverState === 'running';
            const status: string = stopped ? 'stopped' : stopping ? 'stopping' : starting ? 'starting' : ready ? 'ready' : undefined;
            this.serverStatus$.next( status );
            if ( status === 'ready' ) {
                // once 'ready', subscribe to a shorter interval for start of paraview server
                this.monitorPvServer.subscribe( (pvStatus: {status: number}) => {
                    if ( pvStatus.status === 200 ) {
                        // good to connect!, trigger connection
                        this.serverStatus$.next('started')
                        if ( this.monitorEc2 ) {
                            this.monitorEc2.unsubscribe();
                        }
                    }
                });
            }
        });

        // check paraview server status every second
        this.monitorPvServer = interval(1000)
        .pipe(
            takeWhile( () => this.serverStatus$.value !== 'started'),
            startWith(0),
            switchMap(() => this.getParaviewServerStatus())
        )
    }

    getEc2Status() {
        // CheckEC2Status.py lambda link
        // this endpoint is in the code and the repo and is not secure
        // if dev, fake a response with a valid server state
        if (this.awsUrl === '#') {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({ state: 'running', status: 'ok' });
                }, 2000);
            });
        } else {
            return this._http.get(this.awsUrl + '/BrianTestStatusEC2');
        }
    }

    getParaviewServerStatus(): Observable<HttpResponse<string>> {
        let pvSessionUrl: string;
        // local server has sessionURL, prod server has sessionManagerURL
        if ( environmentConfig.sessionURL ) {
            pvSessionUrl = environmentConfig.sessionURL;

        } else if ( environmentConfig.sessionManagerURL ) {
            const baseUrl: string = (environmentConfig.sessionManagerURL.split('//')[1].split('/')[0]);
            pvSessionUrl = 'https://' + baseUrl;
        }
        return this._http.get( pvSessionUrl, { responseType: 'text', observe: 'response' } )
    }

    startEc2() {
        this.serverStatus$.next('starting');
        // StartEC2Instances.py lambda link
        // this endpoint is in the code and the repo and is not secure
        return this._http.get( this.awsUrl + '/BrianTestStartEC2', { responseType: 'text' });
    }

    stopEC2() {
        // StopEC2Instances.py lambda link
        // this endpoint is in the code and the repo and is not secure
        return this._http.get( this.awsUrl + '/BrianTestStopEC2');
    }
}
