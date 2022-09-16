import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import {
    AnalogAxisRangeType,
    AxisFormat,
    DEFAULT_UI_OPTIONS,
    DiscreteAxisRangeType,
    IDataset,
    ImageViewerService,
    IMenuOptions,
    IPlot,
    IUiFeatures,
    PlotsService,
    SeriesDisplayMode,
    UiOptionsService
} from 'scicharts';
import { COLOR_MENU_DEFAULT_VALUES, IMAGE_DATASETS, VARIABLE_CONFIG } from 'src/app/models';
import { environment, localUrls } from 'src/environments/environment';

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

const SATELLITE_NAMES = {
    earth: 'Earth',
    stereoa: 'Stereo A',
    stereob: 'Stereo B'
};

// set the UI features for H3lioViz
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
    @Input() timeRange: number[];
    @Input() runId: string;
    imageData = IMAGE_DATASETS;
    imageList: string[] = Object.keys(this.imageData);
    plotForm: FormGroup = new FormGroup({
        image: new FormControl(),
        variable: new FormControl()
    });
    selectedVariable = COLOR_MENU_DEFAULT_VALUES.colorVariable.serverName;
    variableList: string[] = Object.keys(VARIABLE_CONFIG);

    constructor(
        private _imageViewerService: ImageViewerService,
        private _plotsService: PlotsService,
        private _uiOptionsService: UiOptionsService
    ) {
        // this is needed to show values in the legend
        this._plotsService.enableCrosshairSync();
        this._imageViewerService.setImageViewerSync( true );
        this._uiOptionsService.updateFeatures( H3LIO_PRESET );
        this._uiOptionsService.setPlotGrid( 3, 1 );
        this.plotForm.controls.variable.valueChanges.pipe( debounceTime(1000) ).subscribe( newVariableValue => {
            // reset the plot list
            this._plotsService.setPlots([]);
            // get the current image plot
            if ( this.plotForm.value.image ) {
                this.getImagePlot( this.plotForm.value.image);
            }
            newVariableValue.forEach( (variable: string) => {
                this.getSolarWindData(variable);
            });
        });
        this.plotForm.controls.image.valueChanges.subscribe( newImageValue => {
            // reset the plot list
            this._plotsService.setPlots([]);
            this.getImagePlot( newImageValue );
            // get the current line plots
            this.plotForm.value.variable.forEach( (variable: string) => {
                this.getSolarWindData(variable);
            });
        });
    }
    
    ngOnInit(): void {
        // initialize to the default variable
        this.plotForm.controls.variable.setValue( [ this.selectedVariable ] );
    }

    createImageDataset( variable: string )  {
        const datasetInfo = this.imageData[variable];
        const newDataset = {
            title: datasetInfo.displayName,
            url: environment.latisUrl + datasetInfo.id + '.jsond',
            name: datasetInfo.displayName,
            rangeVariables: [
                'url'
            ],
            selectedRangeVariables: [ 'url' ],
            domainVariables: [ 'time' ]
        };
        return newDataset;
    }

    createPlotGroup( variable: string )  {
        const plotGroup = [];
        [ 'stereoa', 'earth', 'stereob' ].forEach( (satellite: string) => {
            const urlBase: string = environment.production ? environment.aws.api : localUrls.evolutionData;
            const urlSuffix: string = environment.production ? `getTimeSeries/${this.runId}/${satellite}.jsond` : `evo.${satellite}.json`;
            const newDataset: IDataset = {
                url: urlBase + urlSuffix,
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
                selectedRangeVariables: [ variable ],
                domainVariables: [ 'time' ]
            };
            plotGroup.push( newDataset );
        });
        const magVariables = new Set([ 'bx', 'by', 'bz' ]);
        const windVariables = new Set([ 'density', 'velocity', 'temperature' ]);
        if ( magVariables.has(variable) ) {
            const variableNameMap = {
                bx: 'Bx',
                by: 'By',
                bz: 'Bz'
            };
            const archivedAceDataset: IDataset = {
                url: 'https://swp-dev.pdmz.lasp.colorado.edu/space-weather-portal/latis/dap/ace_mag_1m.jsond?',
                name: 'ACE Archived Real Time Data',
                rangeVariables: [ 'Bx', 'By', 'Bz' ],
                selectedRangeVariables: [ variableNameMap[variable] ],
                domainVariables: [ 'time' ]
            };
            plotGroup.push( archivedAceDataset );
        }
        if ( windVariables.has(variable) ) {
            const variableNameMap = {
                density: 'density',
                velocity: 'speed',
                temperature: 'temperature'
            };
            const archivedAceDataset: IDataset = {
                url: 'https://swp-dev.pdmz.lasp.colorado.edu/space-weather-portal/latis/dap/ace_swepam_1m.jsond?',
                name: 'Archived real time ACE data',
                rangeVariables: [ 'density', 'speed', 'temperature' ],
                selectedRangeVariables: [ variableNameMap[variable] ],
                domainVariables: [ 'time' ]
            };
            plotGroup.push( archivedAceDataset );
        }
        return plotGroup;
    }

    getImagePlot( imageDatasetId: string ) {
        const imagePlot: IPlot = {
            collapsed: false,
            datasets: [ this.createImageDataset( imageDatasetId ) ],
            initialOptions: DEFAULT_PLOT_OPTIONS as IMenuOptions,
            range: {
                start: this.timeRange[0] * 1000,
                end: this.timeRange[1] * 1000
            },
            type: 'IMAGE'
        };
        this._plotsService.addPlot( imagePlot );
    }

    getSolarWindData( groupVariable: string ) {
        const plotGroup = this.createPlotGroup( groupVariable );
        const swPlot: IPlot = {
            collapsed: false,
            datasets: plotGroup,
            initialOptions: DEFAULT_PLOT_OPTIONS as IMenuOptions,
            range: {
                start: this.timeRange[0] * 1000,
                end: this.timeRange[1] * 1000
            }
        };
        this._plotsService.addPlot( swPlot );
    }
}
