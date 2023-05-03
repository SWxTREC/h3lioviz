import {
    AnalogAxisRangeType,
    AxisFormat,
    DEFAULT_UI_OPTIONS,
    DiscreteAxisRangeType,
    IMenuOptions,
    IUiFeatures,
    SeriesDisplayMode
} from 'scicharts';

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
        scaling: undefined,
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

