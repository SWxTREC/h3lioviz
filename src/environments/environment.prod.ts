import { version } from '../../package.json';

let siteRootUrl = window.location.origin;
// ensure that the root URL ends with a slash
if ( siteRootUrl.substr(-1) !== '/' ) {
    siteRootUrl += '/';
}

export const environment = {
    aws: {
        cognito: {
            appClientId: 'vha7hq4ant83mhvt47pffkk5k',
            region: 'us-east-1',
            userPoolId: 'Dgc4otkxZ',
            loginPage: 'https://swx-trec.auth.us-east-1.amazoncognito.com',
            identityPoolId: '9f26842f-2e5d-4c32-abf5-91b71e82e3a2'
        }
    },
    production: true,
    siteRootUrl: siteRootUrl,
    version: version
};

export const environmentConfig = {
    application: 'visualizer',
    sessionManagerURL: 'http://paraview.swx-trec.com:8080'
};
