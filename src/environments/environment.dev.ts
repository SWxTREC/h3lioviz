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
            appClientId: 'c5on4cifsqka5mrqcbbcjd3ur',
            region: 'us-west-2',
            userPoolId: 'OigGyk05N',
            loginPage: 'https://dev-swx-trec.auth.us-west-2.amazoncognito.com',
            identityPoolId: '801079fe-6503-4750-9012-22f984383f53'
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
