import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { ProfileNavService } from '../services/profile-nav.service';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private _profileNavService: ProfileNavService
    ) {}

    async canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ) {
        await this._profileNavService.finishedInitialLogin;

        // if the user is logged in, then session tokens will be present
        const isLoggedIn = !!this._profileNavService.getStoredTokens();

        if ( !isLoggedIn ) {
            // execute the handler for clicking the 'sign in' button,
            // and pass it the URL that the user wanted to go to
            this._profileNavService.onSignInClick( state.url );
        }

        return isLoggedIn;
    }
}
