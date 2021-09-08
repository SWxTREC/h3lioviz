import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileNavService } from 'src/app/services/profile-nav.service';

@Component({
    selector: 'lasp-home',
    templateUrl: './home.container.html',
    styleUrls: [ './home.container.scss' ]
})
export class HomeComponent implements AfterViewInit {
    isLoggedIn: boolean;
    @ViewChild('video') video: ElementRef;

    constructor(
        private profileService: ProfileNavService,
        private _router: Router
    ) {
        this.profileService.isLoggedIn.subscribe( loginStatus => {
            if ( loginStatus ) {
                this._router.navigate([ 'visualizer' ]);
            }
            this.isLoggedIn = loginStatus;
        });
    }

    ngAfterViewInit() {
        this.video.nativeElement.muted = true;
        // this promise is needed for the tests to pass
        this.video.nativeElement.play()
            .then( () => {})
            .catch( () => {
                console.error( 'auto play was prevented');
            });
    }

}
