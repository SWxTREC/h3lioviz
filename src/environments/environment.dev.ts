import { version } from '../../package.json';

let siteRootUrl = window.location.origin;
// ensure that the root URL ends with a slash
if ( siteRootUrl.substr(-1) !== '/' ) {
    siteRootUrl += '/';
}

export const environment = {
    aws: {
        api: 'https://apigw.dev.swx-trec.com/enlil',
        cognito: {
            appClientId: '3lihoerp9d5nmrb8i6g0e13g05',
            region: 'us-west-2',
            userPoolId: 'm1uXvZDys',
            loginPage: 'https://dev-swx-trec.auth.us-west-2.amazoncognito.com',
            identityPoolId: '27092902-649f-4118-b0ef-733c51b3fe7e'
        }
    },
    production: true,
    siteRootUrl: siteRootUrl,
    version: version
};

export const environmentConfig = {
    application: 'visualizer',
    sessionManagerURL: 'https://paraview-web.dev.swx-trec.com/paraview'
};
