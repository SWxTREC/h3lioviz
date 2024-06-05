import packageInfo from '../../package.json';

let siteRootUrl = window.location.origin;
// ensure that the root URL ends with a slash
if ( siteRootUrl.slice(-1, 1) !== '/' ) {
    siteRootUrl += '/';
}
// ensure that the root URL in prod ends with the name of the app
if ( siteRootUrl.split('/').filter( pathString => pathString.length ).pop() !== packageInfo.name ) {
    siteRootUrl += name + '/';
}

export const environment = {
    aws: {
        api: 'https://apigw.prod.swx-trec.com/h3lioviz/',
        cognito: {
            appClientId: '3lihoerp9d5nmrb8i6g0e13g05',
            region: 'us-east-1',
            userPoolId: 'm1uXvZDys',
            loginPage: 'https://swx-trec.auth.us-east-1.amazoncognito.com',
            identityPoolId: '27092902-649f-4118-b0ef-733c51b3fe7e'
        }
    },
    dev: false,
    googleAnalyticsId: 'GT-5NRMGGR',
    latisUrl: 'https://lasp.colorado.edu/space-weather-portal/latis/dap/',
    production: true,
    siteRootUrl: siteRootUrl,
    version: packageInfo.version
};

export const environmentConfig = {
    application: 'visualizer',
    sessionManagerURL: 'https://paraview-web.prod.swx-trec.com/paraview/'
};

// these need to be in file, but are not used for 'production' builds
export const localUrls = {
    catalog: '',
    evolutionData: ''
};
