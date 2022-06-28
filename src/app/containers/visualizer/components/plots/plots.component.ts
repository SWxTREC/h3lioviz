import { Component, OnInit } from '@angular/core';
import {
    AnalogAxisRangeType,
    AxisFormat,
    DEFAULT_UI_OPTIONS,
    DiscreteAxisRangeType,
    IMenuOptions,
    IPlot,
    IUiFeatures,
    PlotsService,
    SeriesDisplayMode,
    UiOptionsService
} from 'scicharts';

import { environment } from 'src/environments/environment';

const DEFAULT_PLOT_OPTIONS = {
    dataDisplay: {
        seriesDisplayMode: SeriesDisplayMode.lines,
        allowGaps: true,
        thresholdRatio: 5
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

const PLOTS = {
    'earth-density': {
        url: `${environment.siteRootUrl}assets/data/evo.earth.json`,
        name: 'Earth',
        rangeVariables: [
            'density',
            'velocity',
            'pressure',
            'temperature',
            'bx',
            'by',
            'bz'
        ],
        selectedRangeVariables: [ 'density' ],
        domainVariables: [ 'time' ]
    },
    'stereoa-density': {
        url: `${environment.siteRootUrl}assets/data/evo.stereoa.json`,
        name: 'Stereo A',
        rangeVariables: [
            'density',
            'velocity',
            'pressure',
            'temperature',
            'bx',
            'by',
            'bz'
        ],
        selectedRangeVariables: [ 'density' ],
        domainVariables: [ 'time' ]
    },
    'stereob-density': {
        url: `${environment.siteRootUrl}assets/data/evo.stereob.json`,
        name: 'Stereo B',
        rangeVariables: [
            'density',
            'velocity',
            'pressure',
            'temperature',
            'bx',
            'by',
            'bz'
        ],
        selectedRangeVariables: [ 'density' ],
        domainVariables: [ 'time' ]
    },
    'earth-velocity': {
        url: `${environment.siteRootUrl}assets/data/evo.earth.json`,
        name: 'Earth',
        rangeVariables: [
            'density',
            'velocity',
            'pressure',
            'temperature',
            'bx',
            'by',
            'bz'
        ],
        selectedRangeVariables: [ 'velocity' ],
        domainVariables: [ 'time' ]
    },
    'stereoa-velocity': {
        url: `${environment.siteRootUrl}assets/data/evo.stereoa.json`,
        name: 'Stereo A',
        rangeVariables: [
            'density',
            'velocity',
            'pressure',
            'temperature',
            'bx',
            'by',
            'bz'
        ],
        selectedRangeVariables: [ 'velocity' ],
        domainVariables: [ 'time' ]
    },
    'stereob-velocity': {
        url: `${environment.siteRootUrl}assets/data/evo.stereob.json`,
        name: 'Stereo B',
        rangeVariables: [
            'density',
            'velocity',
            'pressure',
            'temperature',
            'bx',
            'by',
            'bz'
        ],
        selectedRangeVariables: [ 'velocity' ],
        domainVariables: [ 'time' ]
    }
};

// set the UI features for H3lio viz
const H3LIO_PRESET: IUiFeatures = {
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

@Component({
    selector: 'swt-plots',
    templateUrl: './plots.component.html',
    styleUrls: [ './plots.component.scss' ]
})
export class PlotsComponent implements OnInit {

    constructor(
        private _plotsService: PlotsService,
        private _uiOptionsService: UiOptionsService
    ) {
        // this is needed to show values in the legend
        this._plotsService.enableCrosshairSync();
        this._uiOptionsService.updateFeatures( H3LIO_PRESET );
        this._uiOptionsService.setPlotGrid( 2, 1 );
    }

    ngOnInit(): void {
        // reset the plot list
        this._plotsService.setPlots([]);
        this.getSolarWindData();
    }

    getSolarWindData() {
        const densityPlot: IPlot = {
            collapsed: false,
            datasets: [
                PLOTS[ 'stereoa-density' ],
                PLOTS[ 'earth-density' ],
                PLOTS[ 'stereob-density' ]
            ],
            initialOptions: DEFAULT_PLOT_OPTIONS as IMenuOptions,
            range: {
                start: 1635278400000,
                end: 1635883423000
            }
        };
        const velocityPlot: IPlot = {
            collapsed: false,
            datasets: [
                PLOTS[ 'stereoa-velocity' ],
                PLOTS[ 'earth-velocity' ],
                PLOTS[ 'stereob-velocity' ]
            ],
            initialOptions: DEFAULT_PLOT_OPTIONS as IMenuOptions,
            range: {
                start: 1635278400000,
                end: 1635883423000
            }
        };
        this._plotsService.addPlot( densityPlot );
        this._plotsService.addPlot( velocityPlot );
    }
}
