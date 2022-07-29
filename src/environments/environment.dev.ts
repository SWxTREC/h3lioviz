import { version } from '../../package.json';

let siteRootUrl = window.location.origin;
// ensure that the root URL ends with a slash
if ( siteRootUrl.substr(-1) !== '/' ) {
    siteRootUrl += '/';
}

export const environment = {
    aws: {
        api: 'https://apigw.dev.swx-trec.com/h3lioviz',
        cognito: {
            appClientId: '7tefs84hbme9m5etvg34h1hen',
            region: 'us-east-1',
            userPoolId: '1aA5ZzW8s',
            loginPage: 'https://dev-swx-trec.auth.us-east-1.amazoncognito.com',
            identityPoolId: 'c6ff4d3a-226d-4a14-bcac-c32e8f2a7c84'
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
