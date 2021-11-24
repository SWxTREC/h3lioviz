import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { distinctUntilChanged, startWith, switchMap, takeWhile } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProfileNavService } from '../profile-nav/profile-nav.service';

@Injectable({
    providedIn: 'root'
})
export class AwsService {
    awsUrl: string = environment.aws.api;
    loggedIn: boolean;
    serverStatus$: BehaviorSubject<string> = new BehaviorSubject('');
    timeInterval: Subscription;

    constructor(
        private _http: HttpClient,
        private _profileService: ProfileNavService
    ) {
        this._profileService.isLoggedIn.pipe(
            distinctUntilChanged()
        ).subscribe( loginStatus => {
            this.loggedIn = loginStatus;
            if ( loginStatus ) {
                // once logged in, start the Ec2 service here
                // don't send the start command unless the server is stopped
                if ( this.serverStatus$.value === 'stopped') {
                    this.startEc2().subscribe();
                    // set the status to starting
                    this.serverStatus$.next('starting')
                }
            }
            else {
                if ( this.timeInterval ) {
                    this.timeInterval.unsubscribe();
                }
            }
        });

        // while logged in, check server status every 20 seconds
        this.timeInterval = interval(1000 * 20)
        .pipe(
            takeWhile( () => this.loggedIn),
            startWith(0),
            switchMap(() => this.getEc2Status())
        ).subscribe( (ec2: { status: string, state: string}) => {
            const serverState: string = ec2.state;
            const serverStatus: string = ec2.status;
            const stopped: boolean = serverState === 'stopped' || serverState === 'terminated';
            const stopping: boolean = serverState === 'stopping' || serverState === 'shutting-down';
            const starting: boolean = serverState === 'pending' || serverStatus === 'initializing';
            const started: boolean = serverState === 'running' && serverStatus === 'ok';
            const status: string = stopped ? 'stopped' : stopping ? 'stopping' : starting ? 'starting' : started ? 'started' : undefined;
            // TODO: if build === 'dev', return a status of 'started'
            this.serverStatus$.next( status );
        })
    }

    getEc2Status() {
        // CheckEC2Status.py lambda link
        // this endpoint is in the code and the repo and is not secure
        return this._http.get( this.awsUrl + '/BrianTestStatusEC2');
    }

    startEc2() {
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
