import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as apigClientFactory from 'aws-api-gateway-client';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
import * as CognitoIdentityServiceProvider from 'aws-sdk/clients/cognitoidentityserviceprovider';
import { LaspNavService } from 'lasp-nav';

import { environment } from '../../environments/environment';
import { ICognitoTokens, ICognitoUserInfo, StorageKeys } from '../models/auth';
// import { IUserData, updatableUserDataFields } from '../models/user-data';

@Injectable()
export class ProfileNavService extends LaspNavService {

    constructor(
        private _router: Router,
        private _http: HttpClient
    ) {
        super();

        this._cognito = new CognitoIdentityServiceProvider({
            // apiVersion: '2016-04-18',
            region: environment.aws.cognito.region
        });

        // when a user logs in, they are redirected back to the home page of the SDC site, with certain GET parameters.
        // if `code` and `state` are GET parameters, that means the user just logged via Cognito and was redirected back here.
        // This will also resolve if it verifies that the user is not logged in, and is not in the process of logging in
        this.finishedInitialLogin = new Promise( resolve => {
            console.log('finished initial login', resolve());
            const params: any = {};
            window.location.search.substr( 1 ).split( '&' ).forEach( keyval => {
                const keyvalSplit = keyval.split( '=' );
                params[keyvalSplit[0]] = keyvalSplit[1];
            });
            console.log({ params });
            if ( params.code == null || params.state == null ) {
                resolve( undefined );
                return;
            }
            // verify that the 'state' is the same as the stored loginNonce
            if ( params.state === window.localStorage.getItem(StorageKeys.loginNonce) ) {
                // redirect to the saved redirect URL and get some tokens from Cognito
                this._router.navigate([ window.localStorage.getItem(StorageKeys.loginRedirect) ]);

                // clear the saved localStorage items
                window.localStorage.removeItem( StorageKeys.loginNonce );
                window.localStorage.removeItem( StorageKeys.loginRedirect );

                // use the 'code' from the GET params to retrieve tokens from Cognito
                this._http.post(
                    `${environment.aws.cognito.loginPage}/oauth2/token`,
                    `grant_type=authorization_code`
                        + `&redirect_uri=${environment.siteRootUrl}`
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

    // a promise that resolves shortly after the app has loaded, after the login process has completed,
    // or immediately after the app has loaded if the user is not currently logging in
    finishedInitialLogin: Promise<any>;

    cognitoIdentityId: string;
    cognitoIdentityCredentials: CognitoIdentity.Credentials;

    // some of the API endpoints use a different kind of authentication, and for those we need to use apigClientFactory to create a
    // separate instance of apigClient for each set of endpoints that share the same root URL.
    private _apigClients: { [rootUrl: string]: any } = {};

    // private _cachedUserData: IUserData;

    private _cognito: CognitoIdentityServiceProvider;
    private _cognitoIdentity: CognitoIdentity;
    // async getCognitoUserInfo(): Promise<ICognitoUserInfo> {
    //     await this.finishedInitialLogin;
    //     console.log('HELLO!!');
    //     const request = new HttpRequest( 'GET', `${environment.aws.cognito.loginPage}/oauth2/userInfo` );
    //
    //     return await this.makeAwsRequest( request );
    // }

    // async getAllUserData(): Promise<IUserData> {
    //     if ( !this._cachedUserData ) {
    //         await this.finishedInitialLogin;
    //
    //         const user: any = await this._makeRequestWithTokenRefresh( () => {
    //             return new Promise( (resolve, reject) => {
    //                 this._cognito.getUser(
    //                     { AccessToken: this.getStoredTokens().access_token },
    //                     (e, data) => e ? reject(e) : resolve(data)
    //                 );
    //             });
    //         });
    //
    //         // the response has an array of objects like { Name: 'foo', Value: 'bar' }. Map this to an object like { foo: 'bar' }
    //         const cognitoData: any = {};
    //         user.UserAttributes.forEach( attribute => {
    //             cognitoData[attribute.Name] = attribute.Value;
    //         });
    //
    //         // We can only store strings in Cognito. Convert as necessary
    //         cognitoData['custom:registration_done'] = cognitoData['custom:registration_done'] === 'true' ? true : false;
    //         cognitoData['custom:data_notifications'] = cognitoData['custom:data_notifications'] === 'true' ? true : false;
    //         // all non-number and non-boolean values should be a string. Convert falsy values to '' and call `toString` on other values
    //         Object.keys( cognitoData ).forEach( key => {
    //             if ( typeof cognitoData[key] !== 'number' && typeof cognitoData[key] !== 'boolean' ) {
    //                 cognitoData[key] = !cognitoData[key] ? '' : cognitoData[key].toString();
    //             }
    //         });
    //         // add an extra attribute
    //         cognitoData.isScienceTeamMember = this.isOnScienceTeam();
    //
    //         this._cachedUserData = cognitoData;
    //     }
    //
    //     return this._cachedUserData;
    // }
    //
    // async updateUserData( newData: IUserData ) {
    //     await this.finishedInitialLogin;
    //
    //     // make a copy of the newData object so we don't mutate the original
    //     newData = Object.assign( {}, newData );
    //
    //     // map the given object to an array of objects that AWS expects
    //     const attributes: { Name: string, Value: string }[] = [];
    //     Object.keys( newData ).forEach( key => {
    //         // only include keys that the user can update
    //         if ( !updatableUserDataFields.includes(key) ) {
    //             return;
    //         }
    //         // we can only store strings in cognito; convert booleans and numbers to strings
    //         let value = newData[key];
    //         if ( typeof value === 'boolean' ) {
    //             value = value ? 'true' : 'false';
    //         }
    //         attributes.push({
    //             Name: key,
    //             Value: value.toString()
    //         });
    //     });
    //
    //     // update the attributes in Cognito
    //     await this._makeRequestWithTokenRefresh( () => {
    //         return new Promise( (resolve, reject) => {
    //             this._cognito.updateUserAttributes({
    //                 AccessToken: this.getStoredTokens().access_token,
    //                 UserAttributes: attributes
    //             }, (e, data) => e ? reject(e) : resolve(data) );
    //         });
    //     });
    //
    //     // update the cached user data
    //     Object.assign( this._cachedUserData, newData );
    // }

    // async loadUserProfile(): Promise<{ firstName?: string, lastName?: string, username?: string }> {
    //     return {
    //         // we don't get a name from Cognito, and the username is a random string of hex characters.
    //         // the only sensible thing we get back is the email address, so use that as the name, and use
    //         // the 'username' field to show group membership status
    //         firstName: ( await this.getCognitoUserInfo() ).email,
    //         lastName: '',
    //         username: ''
    //     };
    // }

    onSignInClick( destinationUrl?: string ) {
        console.log('on sign in click');
        // set the URL that the user will be redirected to after logging in
        destinationUrl = destinationUrl || this._router.url;
        // create a login nonce for security, and store that as well as the current route so we can properly redirect after login.
        // generate a random 11-character string by converting a random number to base 36, which uses letters and numbers,
        // then remove the `0.` from the beginning of the string
        const loginNonce = Math.random().toString( 36 ).substring( 2 );
        window.localStorage.setItem( StorageKeys.loginNonce, loginNonce );
        window.localStorage.setItem( StorageKeys.loginRedirect, destinationUrl );
        window.location.href = `${environment.aws.cognito.loginPage}/login`
            + `?client_id=${environment.aws.cognito.appClientId}`
            + `&response_type=code`
            + `&scope=openid+profile+email+phone+aws.cognito.signin.user.admin`
            + `&redirect_uri=${environment.siteRootUrl}`
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

    // /** Gets a list of groups that the user is a member of */
    // getGroups(): string[] {
    //     try {
    //         // the user's groups are stored in the JWT, which is stored during login
    //         // the JWT is stored as three JSON-formatted base-64 strings, separated by periods, like (header).(payload).(signature)
    //         // the groups are in the payload section of the JWT
    //         const tokens = this.getStoredTokens();
    //         const jwtPayload = JSON.parse( atob( tokens.id_token.split( '.' )[1] ) );
    //         return jwtPayload['cognito:groups'] || [];
    //     } catch ( e ) {
    //         return [];
    //     }
    // }
    //
    // isOnScienceTeam(): boolean {
    //     return this.getGroups().includes( 'emm-science-team' );
    // }

    /**
     * Handles a request to AWS and refreshes the login session if needed.
     * Automatically adds authorization headers if the user is logged in.
     */
    async makeAwsRequest( request: HttpRequest<any> ): Promise<any> {
        console.log('make aws request');
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
            // invalidate the identity credentials and the apigClient objects that use them so that these also get refreshed later
            delete this.cognitoIdentityCredentials;
            this._apigClients = [];

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
            if ( e.status >= 400 && e.status < 500 ) {
                await this._refreshCognitoAccessToken();
                // make the original request again. This time, it will use the new access token
                return await requestPromiseFactory();
            } else {
                throw e;
            }
        }
    }

    makeAwsSig4Request( rootUrl: string, path: string, params: { [key: string]: any }, parseAsJson = true ): Promise<any> {
        return this._makeRequestWithTokenRefresh( () => {
            return new Promise( async(resolve, reject) => {
                // sig4 requires that we sign each request with AWS IAM credentials. This signing is easily done with apigClient instances.
                // Due to the way the apigClient library works, we must have a separate instance for each root URL.
                // Create a new apigClient instance for the given root URL if needed.
                if ( this._apigClients[rootUrl] == null ) {
                    // we must get AWS IAM credentials first in order to sign with AwsSig4
                    try {
                        const credentials = await this._getIdentityCredentials();
                        this._apigClients[rootUrl] = new apigClientFactory.default.newClient({
                            invokeUrl: rootUrl,
                            region: environment.aws.cognito.region,
                            accessKey: credentials.AccessKeyId,
                            secretKey: credentials.SecretKey,
                            sessionToken: credentials.SessionToken
                        });
                    } catch ( e ) {
                        reject( e );
                    }
                }

                // make the request
                this._apigClients[rootUrl].invokeApi( {}, path, 'GET', { queryParams: params } ).then( result => {
                    // the data is parsed JSON by default. Stringify if `parseAsJson` is false
                    resolve( parseAsJson ? result.data : JSON.stringify(result.data) );
                }, error => {
                    console.error( error );
                    reject( error );
                });
            });
        });
    }

    /** Uses Cognito User session tokens to get Cognito Identity credentials */
    async _getIdentityCredentials(): Promise<CognitoIdentity.Credentials> {
        console.log('get identity credentials');
        // we must have the Cognito user info before we can get Identity credentials
        await this.finishedInitialLogin;

        // return the cached value if it's available
        if ( this.cognitoIdentityCredentials != null ) {
            return this.cognitoIdentityCredentials;
        }

        if ( this._cognitoIdentity == null ) {
            this._cognitoIdentity = new CognitoIdentity({
                // apiVersion: '2014-06-30',
                region: environment.aws.cognito.region
            });
        }

        return new Promise( (resolve, reject) => {

            const cognitoLoginProvider = `cognito-idp.${environment.aws.cognito.region}.amazonaws.com/${environment.aws.cognito.region}_${environment.aws.cognito.userPoolId}`;
            const idToken = this.getStoredTokens().id_token;
            const logins = {
                [cognitoLoginProvider]: idToken
            };

            // use the Cognito tokens to get the Identity ID, then use that to get the Identity credentials
            this._cognitoIdentity.getId({
                IdentityPoolId: `${environment.aws.cognito.region}:${environment.aws.cognito.identityPoolId}`,
                Logins: logins
            }, (getIdErr, getIdData) => {
                if ( getIdErr ) {
                    return reject( getIdErr );
                }

                this.cognitoIdentityId = getIdData.IdentityId;
                this._cognitoIdentity.getCredentialsForIdentity({
                    IdentityId: this.cognitoIdentityId,
                    Logins: logins
                }, (credentialsErr, credentialsData) => {
                    if ( credentialsErr ) {
                        return reject( credentialsErr );
                    }

                    // cache and resolve with the result
                    this.cognitoIdentityCredentials = credentialsData.Credentials;
                    resolve( credentialsData.Credentials );
                });
            });
        });
    }

    onFailToRefresh(): Promise<any> {
        this.logout();
        this.setLoggedIn( false );
        return Promise.reject( 'Failed to refresh authentication' );
    }
}
