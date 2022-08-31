import { name, version } from '../../package.json';

let siteRootUrl = window.location.origin;

// ensure that the root URL ends with a slash
if ( siteRootUrl.slice(-1, 1) !== '/' ) {
    siteRootUrl += '/';
}

// if not on localhost, ensure that the root URL in ends with the name of the app
if ( !siteRootUrl.includes('localhost') && siteRootUrl.split('/').filter( pathString => pathString.length ).pop() !== name ) {
    siteRootUrl += name + '/';
}

export const environment = {
    aws: {
        api: 'https://apigw.dev.swx-trec.com/h3lioviz',
        cognito: {
            appClientId: '5itqpae8gseickjbemm5tprpef',
            region: 'us-east-1',
            userPoolId: 'Dgc4otkxZ',
            loginPage: 'https://swx-trec.auth.us-east-1.amazoncognito.com',
            identityPoolId: '9f26842f-2e5d-4c32-abf5-91b71e82e3a2'
        }
    },
    catalogUrl: 'https://apigw.dev.swx-trec.com/h3lioviz/availableRuns',
    production: true,
    siteRootUrl: siteRootUrl,
    version: version
};

export const environmentConfig = {
    application: 'visualizer',
    sessionManagerURL: 'https://paraview-web.dev.swx-trec.com/paraview/'
};
