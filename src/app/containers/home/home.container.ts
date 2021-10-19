import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ProfileNavService } from 'src/app/services';

@Component({
    selector: 'lasp-home',
    templateUrl: './home.container.html',
    styleUrls: [ './home.container.scss' ]
})
export class HomeComponent implements AfterViewInit {
    isLoggedIn: boolean;
    @ViewChild('video') video: ElementRef;

    constructor(
        private profileService: ProfileNavService
    ) {
        this.profileService.isLoggedIn.subscribe( loginStatus => {
            this.isLoggedIn = loginStatus;
        });
    }

    ngAfterViewInit() {
    }

}
