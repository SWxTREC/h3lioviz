import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ProfileNavService } from '../profile-nav/profile-nav.service';

@Injectable({
    providedIn: 'root'
})
export class AwsService {
    awsUrl: string = environment.aws.api;
    serverStatus$: Observable<any>;

    constructor(
        private _http: HttpClient,
        private _profileService: ProfileNavService
    ) {
        this._profileService.isLoggedIn.pipe(
            distinctUntilChanged()
        ).subscribe( loginStatus => {
            if ( loginStatus ) {
                // once logged in, start the Ec2 service here
                this.startEc2().subscribe();
            }
        });

        // check server status every 20 seconds
        // this is lazy, so will only run when a subscription to this.serverStatus$ is active
        this.serverStatus$ = interval(1000 * 20)
        .pipe(
            startWith(0),
            switchMap(() => this.getEc2Status())
        )
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
