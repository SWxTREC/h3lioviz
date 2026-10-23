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

// SWPC's backend host. It is not the page's host, whose CDN cannot reach the backend.
const backendUrl = 'https://h3lioviz.swpc-dev.woc.noaa.gov/h3lioviz/';

export const environment = {
    aws: {
        api: backendUrl + 'app/'
    },
    dev: false,
    googleAnalyticsId: '',
    latisUrl: 'https://lasp.colorado.edu/space-weather-portal/latis/dap/',
    isDeployedDev: false,
    production: true,
    siteRootUrl: siteRootUrl,
    version: packageInfo.version
};

export const environmentConfig = {
    application: 'visualizer',
    sessionManagerURL: backendUrl + 'paraview/'
};

// these need to be in file, but are not used for 'production' builds
export const localUrls = {
    catalog: '',
    evolutionData: ''
};
