import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { LaspNavService } from 'lasp-nav';
import { ICognitoTokens, ICognitoUserInfo, StorageKeys } from 'src/app/models/auth';
import { environment } from 'src/environments/environment';

@Injectable()
export class ProfileNavService extends LaspNavService {
    private _cognito: CognitoIdentityServiceProvider;
    private _cognitoIdentity: CognitoIdentity;
    private _refreshTokenRequest: Promise<void>;
    cognitoIdentityId: string;
    cognitoIdentityCredentials: CognitoIdentity.Credentials;
    // a promise that resolves shortly after the app has loaded, after the login process has completed,
    // or immediately after the app has loaded if the user is not currently logging in
    finishedInitialLogin: Promise<any>;
    showUserProfile = true;

    constructor(
        private _router: Router,
        private _http: HttpClient
    ) {
        super();

        this._cognito = new CognitoIdentityServiceProvider({
            region: environment.aws.cognito.region
        });

        // when a user logs in, they are redirected back to the home page.
        // This will also resolve if it verifies that the user is not logged in, and is not in the process of logging in
        this.finishedInitialLogin = new Promise( resolve => {
            const params: any = {};
            window.location.search.slice( 1 ).split( '&' ).forEach( keyval => {
                const keyvalSplit = keyval.split( '=' );
                params[keyvalSplit[0]] = keyvalSplit[1];
            });
            if ( params.code == null || params.state == null ) {
                resolve( undefined );
                return;
            }
            // verify that the 'state' is the same as the stored loginNonce
            if ( params.state === window.localStorage.getItem(StorageKeys.loginNonce) ) {
                // redirect to the saved redirect URL and get some tokens from Cognito
                this._router.navigateByUrl( window.localStorage.getItem(StorageKeys.loginRedirect) );


                // clear the saved localStorage items
                window.localStorage.removeItem( StorageKeys.loginNonce );
                window.localStorage.removeItem( StorageKeys.loginRedirect );
                // use the 'code' from the GET params to retrieve tokens from Cognito
                this._http.post(
                    `${environment.aws.cognito.loginPage}/oauth2/token`,
                    `grant_type=authorization_code`
                        + `&redirect_uri=${environment.siteRootUrl}index.html`
                        + `&code=${params.code}`
                        + `&client_id=${environment.aws.cognito.appClientId}`,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                ).toPromise().then( (response: ICognitoTokens) => {
                    // save the tokens to localStorage so the session can persist across refreshes
                    window.localStorage.setItem( StorageKeys.cognitoTokens, JSON.stringify(response) );
                    this.setLoggedIn( true );
                    resolve( undefined );
                });
            } else {
                resolve( undefined );
            }
        });
    }

    async getCognitoUserInfo(): Promise<ICognitoUserInfo> {
        await this.finishedInitialLogin;
        const request = new HttpRequest( 'GET', `${environment.aws.cognito.loginPage}/oauth2/userInfo` );

        return await this.makeAwsRequest( request );
    }

    async loadUserProfile(): Promise<{ firstName?: string; lastName?: string; username?: string }> {
        const cognitoInfo = await this.getCognitoUserInfo();
        return {
            firstName: cognitoInfo.username,
            lastName: '',
            username: cognitoInfo.email
        };
    }

    onSignInClick( destinationUrl?: string ) {
        // after login, redirect to the visualizer by default (the only page with an auth guard)
        destinationUrl = destinationUrl || '/visualizer';
        // create a login nonce for security, and store that as well as the current route so we can properly redirect after login.
        // generate a random 11-character string by converting a random number to base 36, which uses letters and numbers,
        // then remove the `0.` from the beginning of the string
        const loginNonce = Math.random().toString( 36 ).substring( 2 );
        window.localStorage.setItem( StorageKeys.loginNonce, loginNonce );
        window.localStorage.setItem( StorageKeys.loginRedirect, destinationUrl );
        window.location.href = `${environment.aws.cognito.loginPage}/login`
            + `?client_id=${environment.aws.cognito.appClientId}`
            + `&response_type=code`
            + `&scope=openid profile email phone aws.cognito.signin.user.admin`
            + `&redirect_uri=${environment.siteRootUrl}index.html`
            + `&state=${loginNonce}`;
    }

    async logout(): Promise<void> {
        // removing the tokens from storage means we can't use them for authenticated requests anymore
        window.localStorage.removeItem( StorageKeys.cognitoTokens );
        // redirect the user to the home page
        this._router.navigate([ '/' ]);
    }

    getStoredTokens(): ICognitoTokens {
        try {
            return JSON.parse( window.localStorage.getItem(StorageKeys.cognitoTokens) );
        } catch ( e ) {
            return null;
        }
    }

    /**
     * Handles a request to AWS and refreshes the login session if needed.
     * Automatically adds authorization headers if the user is logged in.
     */
    async makeAwsRequest( request: HttpRequest<any> ): Promise<any> {
        const response = await this._makeRequestWithTokenRefresh( () => {
            // load stored tokens and add them to the headers
            const isOauthRequest = request.url.includes( 'oauth2' );
            const tokens = this.getStoredTokens();
            if ( tokens ) {
                request = request.clone({
                    setHeaders: {
                        // requests to the API Gateway endpoint require "Authorization: {access_token}",
                        // but requests to the oauthendpoint require "Authorization: Bearer {access_token}"
                        Authorization: isOauthRequest ? 'Bearer ' + tokens.access_token : tokens.access_token
                    }
                });
            }
            // make the request
            return this._http.request( request ).toPromise();
        });
        return response.body;
    }

    private async _refreshCognitoAccessToken(): Promise<void> {
        try {
            // attempt to get new access tokens using the stored refresh token
            const tokens = this.getStoredTokens();
            const newTokens: ICognitoTokens = await this._http.post(
                `${environment.aws.cognito.loginPage}/oauth2/token`,
                `grant_type=refresh_token`
                    + `&client_id=${environment.aws.cognito.appClientId}`
                    + `&refresh_token=${tokens.refresh_token}`,
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
            ).toPromise() as ICognitoTokens;

            // this response doesn't include the refresh token, so add that to the set of new tokens before saving to localStorage
            newTokens.refresh_token = tokens.refresh_token;
            window.localStorage.setItem( StorageKeys.cognitoTokens, JSON.stringify(newTokens) );
        } catch ( e ) {
            return this.onFailToRefresh();
        }
    }

    /**
     * Makes a request, and if it fails, attempts to refresh the Cognito access token and retry the request.
     * This method only works if the access token is fetched via `this.getStoredTokens()` in the `requestPromiseFactory` function
     * passed to this method.
     */
    private async _makeRequestWithTokenRefresh( requestPromiseFactory: () => Promise<any> ): Promise<any> {
        // try making the request once
        try {
            return await requestPromiseFactory();
        } catch ( e ) {
            // if it fails with a 4XX error code, try to refresh the access token
            const status = e.status ?? e.statusCode;
            if ( status >= 400 && status < 500 ) {
                if ( this._refreshTokenRequest == null ) {
                    this._refreshTokenRequest = this._refreshCognitoAccessToken();
                }
                await this._refreshTokenRequest;
                // make the original request again. This time, it will use the new access token
                return await requestPromiseFactory();
            } else {
                throw e;
            }
        }
    }

    onFailToRefresh(): Promise<any> {
        this.logout();
        this.setLoggedIn( false );
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject( 'Failed to refresh authentication' );
    }
}
