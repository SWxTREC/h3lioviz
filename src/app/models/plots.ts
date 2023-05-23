import {
    AnalogAxisRangeType,
    AxisFormat,
    DEFAULT_UI_OPTIONS,
    DiscreteAxisRangeType,
    IDataset,
    IMenuOptions,
    IPlotParams,
    IUiFeatures,
    SeriesDisplayMode
} from 'scicharts';
import { environment, localUrls } from 'src/environments/environment';

export const DEFAULT_PLOT_OPTIONS: IMenuOptions  = {
    dataDisplay: {
        seriesDisplayMode: SeriesDisplayMode.lines,
        allowGaps: true,
        thresholdRatio: 5,
        maxLegendPrecision: 0
    },
    useGlobalSettings: false,
    view: {
        navigator: false,
        yAxes: true
    },
    xAxis: {
        labels: AxisFormat.auto
    },
    yAxis: {
        range: {
            analogType: AnalogAxisRangeType.auto,
            discreteType: DiscreteAxisRangeType.showFullRange,
            low: null,
            high: null
        },
        scaling: 'linear',
        useMultipleAxes: false
    }
};

// set the UI features for H3lioViz
export const H3LIO_PRESET: IUiFeatures = {
    featureList: DEFAULT_UI_OPTIONS.features.featureList,
    toolbar: false,
    filters: false,
    metadata: false,
    download: true,
    globalSettings: false,
    overplot: false,
    limits: false,
    events: false,
    binnedData: false,
    discreteData: false,
    rangeSelector: false,
    sliceSelector: false,
    collapsible: false,
    modifyDatasetsButton: false
};

export const SATELLITE_NAMES = {
    earth: 'Earth',
    stereoa: 'Stereo A',
    stereob: 'Stereo B'
};

export const IMAGE_DATASETS = {
    sdo_aia_0094_image_files: {
        id: 'sdo_aia_0094_image_files',
        displayName: 'SDO AIA 094 (green)'
    },
    sdo_aia_0094_0335_0193_image_files: {
        id: 'sdo_aia_0094_0335_0193_image_files',
        displayName: 'SDO AIA 094, 335, 193 composite'
    },
    sdo_aia_0131_image_files: {
        id: 'sdo_aia_0131_image_files',
        displayName: 'SDO AIA 131 (teal)'
    },
    sdo_aia_0171_image_files: {
        id: 'sdo_aia_0171_image_files',
        displayName: 'SDO AIA 171 (gold)'
    },
    sdo_aia_0193_image_files: {
        id: 'sdo_aia_0193_image_files',
        displayName: 'SDO AIA 193 (bronze)'
    },
    sdo_aia_0211_image_files: {
        id: 'sdo_aia_0211_image_files',
        displayName: 'SDO AIA 211 (purple)'
    },
    sdo_aia_0211_0193_0171_image_files: {
        id: 'sdo_aia_0211_0193_0171_image_files',
        displayName: 'SDO AIA 211, 193, 171 composite'
    },
    sdo_aia_0304_image_files: {
        id: 'sdo_aia_0304_image_files',
        displayName: 'SDO AIA 304 (red)'
    },
    sdo_aia_0304_0211_0171_image_files: {
        id: 'sdo_aia_0304_0211_0171_image_files',
        displayName: 'SDO AIA 304, 211, 171 composite'
    },
    sdo_aia_0335_image_files: {
        id: 'sdo_aia_0335_image_files',
        displayName: 'SDO AIA 335 (blue)'
    },
    sdo_aia_1600_image_files: {
        id: 'sdo_aia_1600_image_files',
        displayName: 'SDO AIA 1600 (yellow/green)'
    },
    sdo_aia_1700_image_files: {
        id: 'sdo_aia_1700_image_files',
        displayName: 'SDO AIA 1700 (pink)'
    },
    sdo_aia_4500_image_files: {
        id: 'sdo_aia_4500_image_files',
        displayName: 'SDO AIA 4500 (white light)'
    },
    sdo_hmib_image_files: {
        id: 'sdo_hmib_image_files',
        displayName: 'SDO HMI magnetogram'
    },
    sdo_hmibc_image_files: {
        id: 'sdo_hmibc_image_files',
        displayName: 'SDO HMI magnetogram colorized'
    },
    sdo_hmiic_image_files: {
        id: 'sdo_hmiic_image_files',
        displayName: 'SDO HMI intensitygram continuum'
    },
    sdo_hmiif_image_files: {
        id: 'sdo_hmiif_image_files',
        displayName: 'SDO HMI intensitygram flat'
    },
    soho_lasco_c2_files: {
        id: 'soho_lasco_c2_files',
        displayName: 'SOHO LASCO C2'
    },
    soho_lasco_c3_files: {
        id: 'soho_lasco_c3_files',
        displayName: 'SOHO LASCO C3'
    },
    stereo_a_cor1_files: {
        id: 'stereo_a_cor1_files',
        displayName: 'STEREO A Coronagraph 1'
    },
    stereo_a_cor2_files: {
        id: 'stereo_a_cor2_files',
        displayName: 'STEREO A Coronagraph 2'
    }
};

export const imageDatasetCatalog: { [parameter: string]: IDataset } = Object.keys(IMAGE_DATASETS).reduce( (aggregator, dataset) => {
    const datasetInfo = IMAGE_DATASETS[dataset];
    const scichartsDataset: IDataset = {
        url: environment.latisUrl + datasetInfo.id + '.jsond',
        name: datasetInfo.displayName,
        rangeVariables: [
            'url'
        ],
        selectedRangeVariables: [ 'url' ],
        domainVariables: [ 'time' ]
    };
    // some image datasets are converted to files because they are not standard types
    const needsType = !dataset.includes('image');
    if ( needsType ) {
        scichartsDataset.type = 'STRING_LIST';
    }
    aggregator[dataset] = scichartsDataset;
    return aggregator;
}, {});

export const modelDatasetCatalog: { [parameter: string]: IDataset } =
    [ 'stereoa', 'earth', 'stereob' ].reduce( ( aggregator, satellite: string) => {
        const urlBase: string = environment.production ? environment.aws.api : localUrls.evolutionData;
        // const urlSuffix: string = environment.production ? `getTimeSeries/${this.runId}/${satellite}.jsond` : `evo.${satellite}.json`;
        const newDataset: IDataset = {
        // TODO will need to add the suffix when called from the catalog later
            url: urlBase, // + urlSuffix,
            name: 'Model data ' + SATELLITE_NAMES[satellite],
            rangeVariables: [
                'density',
                'velocity',
                'pressure',
                'temperature',
                'bx',
                'by',
                'bz'
            ],
            // selectedRangeVariables: [ variable ],
            domainVariables: [ 'time' ]
        };
        aggregator[ satellite ] = newDataset;
        return aggregator;
    }, {});

export const observedDatasetCatalog: { [parameter: string]: IDataset } = {
    ace_mag_1m: {
        url: environment.latisUrl + 'ace_mag_1m.jsond?',
        name: 'ACE Archived Real Time Data',
        rangeVariables: [ 'Bx', 'By', 'Bz' ],
        // selectedRangeVariables: [ variableNameMap[variable] ],
        domainVariables: [ 'time' ]
    },
    ace_swepam_1m: {
        url: environment.latisUrl + 'ace_swepam_1m.jsond?',
        name: 'Archived real time ACE data',
        rangeVariables: [ 'density', 'speed', 'temperature' ],
        // selectedRangeVariables: [ variableNameMap[variable] ],
        domainVariables: [ 'time' ]
    }
};

export const datasetMapById: { [parameter: string]: IDataset } =
    Object.assign( {}, imageDatasetCatalog, modelDatasetCatalog, observedDatasetCatalog );

export const DEFAULT_PLOT_CONFIG: IPlotParams[] = [
    {
        datasets: [
            {
                datasetId: 'stereoa',
                rangeVars: [ 'density' ]
            },
            {
                datasetId: 'earth',
                rangeVars: [ 'density' ]
            },
            {
                datasetId: 'stereob',
                rangeVars: [ 'density' ]
            }
        ],
        options: {}
    }
];
