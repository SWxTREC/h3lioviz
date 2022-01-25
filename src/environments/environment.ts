/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.

import { version } from '../../package.json';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

let siteRootUrl = window.location.origin;
// ensure that the root URL ends with a slash
if ( siteRootUrl.substr(-1) !== '/' ) {
    siteRootUrl += '/';
}

export const environment = {
    aws: {
        // we don't want to hit AWS when developing locally, so an empty api string here
        api: '#',
        cognito: {
            appClientId: '5itqpae8gseickjbemm5tprpef',
            region: 'us-east-1',
            userPoolId: 'Dgc4otkxZ',
            loginPage: 'https://swx-trec.auth.us-east-1.amazoncognito.com',
            identityPoolId: '9f26842f-2e5d-4c32-abf5-91b71e82e3a2'
        }
    },
    production: false,
    siteRootUrl: siteRootUrl,
    version: version
};

export const environmentConfig = {
    application: 'visualizer',
    pvServer: 'http://localhost:8080',
    sessionURL: '',
    sessionManagerURL: 'http://localhost:8080/paraview'
};
