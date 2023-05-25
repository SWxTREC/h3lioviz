import { Component, Input, OnChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import {
    IDataset,
    ImageViewerService,
    IMenuOptions,
    IPlot,
    IPlotParams,
    PlotsService,
    UiOptionsService
} from 'scicharts';
import {
    DEFAULT_PLOT_OPTIONS,
    H3LIO_PRESET,
    IMAGE_DATASETS,
    imageDatasetCatalog,
    ISiteConfig,
    modelDatasetCatalog,
    observedDatasetCatalog,
    SATELLITE_NAMES
} from 'src/app/models';
import { environment, localUrls } from 'src/environments/environment';

@Component({
    selector: 'swt-plots',
    templateUrl: './plots.component.html',
    styleUrls: [ './plots.component.scss' ]
})
export class PlotsComponent implements OnChanges {
    @Input() timeRange: number[];
    @Input() runId: string;
    @Input() plotConfig: IPlotParams[];
    imageData = IMAGE_DATASETS;
    imageList: string[] = Object.keys(this.imageData);
    plotForm: FormGroup = new FormGroup({
        image: new FormControl(),
        model: new FormControl(),
        observed: new FormControl()
    });
    variableList: string[] = [ 'density', 'velocity', 'pressure', 'temperature', 'bx', 'by', 'bz' ];
    observedVariableList: string[] = [ 'density', 'speed', 'temperature', 'Bx', 'By', 'Bz' ];
    siteConfig: ISiteConfig;

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
        this.plotForm.valueChanges.pipe( debounceTime(1000) ).subscribe( newValue => {
            // reset the plot list
            this._plotsService.setPlots([]);
            if ( newValue.image?.length ) {
                this.getImagePlot( newValue.image );
            }
            if ( newValue.model?.length) {
                newValue.model.forEach( (variable: string, index: number) => {
                    this.getModelPlot(variable, index);
                });
            }
            if ( newValue.observed?.length ) {
                this.getObservedPlot( newValue.observed );
            }
        });
    }

    ngOnChanges() {
        const plotsToSet = this.getPlotListByFormCategory( this.plotConfig );
        this.plotForm.setValue( plotsToSet );
    }
    createImageDataset( imageDatasetId: string )  {
        const datasetInfo = this.imageData[imageDatasetId];
        const newDataset: IDataset = {
            uid: imageDatasetId,
            url: environment.latisUrl + datasetInfo.id + '.jsond',
            name: datasetInfo.displayName,
            rangeVariables: [
                'url'
            ],
            selectedRangeVariables: [ 'url' ],
            domainVariables: [ 'time' ]
        };
        // some image datasets are converted to files because they are not standard types
        const needsType = !imageDatasetId.includes('image');
        if ( needsType ) {
            newDataset.type = 'STRING_LIST';
        }
        return newDataset;
    }

    createDatasetGroup( variable: string )  {
        const plotGroup = [];
        // push model data to plotGroup
        [ 'stereoa', 'earth', 'stereob' ].forEach( (satellite: string) => {
            const urlBase: string = environment.production ? environment.aws.api : localUrls.evolutionData;
            const urlSuffix: string = environment.production ? `getTimeSeries/${this.runId}/${satellite}.jsond` : `evo.${satellite}.json`;
            const newDataset: IDataset = {
                uid: satellite,
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
        return plotGroup;
    }

    getImagePlot( imageIds: string[] ) {
        const imageDatasets = imageIds.map( imageId => this.createImageDataset( imageId ));
        const imagePlot: IPlot = {
            collapsed: false,
            datasets: imageDatasets,
            initialOptions: DEFAULT_PLOT_OPTIONS as IMenuOptions,
            range: {
                start: this.timeRange[0] * 1000,
                end: this.timeRange[1] * 1000
            },
            type: 'IMAGE'
        };
        this._plotsService.addPlot( imagePlot );
    }

    getModelPlot( groupVariable: string, index: number ) {
        const datasetGroup = this.createDatasetGroup( groupVariable );
        const modelPlot: IPlot = {
            collapsed: false,
            datasets: datasetGroup,
            initialOptions: DEFAULT_PLOT_OPTIONS as IMenuOptions,
            range: {
                start: this.timeRange[0] * 1000,
                end: this.timeRange[1] * 1000
            }
        };
        this._plotsService.addPlot( modelPlot );
    }

    createObservedDataset( instrument: string, variables: string[] ) {
        if ( instrument === 'mag' ) {
            const archivedMagDataset: IDataset = {
                uid: 'ace_mag_1m',
                url: environment.latisUrl + 'ace_mag_1m.jsond?',
                name: 'ACE Archived Real Time Mag Data',
                rangeVariables: [ 'Bx', 'By', 'Bz' ],
                selectedRangeVariables: variables,
                domainVariables: [ 'time' ]
            };
            return archivedMagDataset;
        }
        if ( instrument === 'swepam' ) {
            const archivedSwepamDataset: IDataset = {
                uid: 'ace_swepam_1m',
                url: environment.latisUrl + 'ace_swepam_1m.jsond?',
                name: 'ACE Archived real time Swepam data',
                rangeVariables: [ 'density', 'speed', 'temperature' ],
                selectedRangeVariables: variables,
                domainVariables: [ 'time' ]
            };
            return archivedSwepamDataset;
        }
    }

    getObservedPlot( variables: string[] ) {
        const observedVariablesByInstrument = variables.reduce( ( aggregator, variable ) => {
            const mag = new Set([ 'Bx', 'By', 'Bz' ]);
            const swepam = new Set([ 'density', 'speed', 'temperature' ]);
            if ( mag.has(variable)) {
                aggregator.mag.push( variable );
            }
            if ( swepam.has( variable ) ) {
                aggregator.swepam.push( variable );
            }
            return aggregator;
        }, { mag: [], swepam: []});
        const observedDatasets = Object.keys( observedVariablesByInstrument )
            .map( key => {
                if ( observedVariablesByInstrument[key].length ) {
                    return this.createObservedDataset(key, observedVariablesByInstrument[key] );
                } else {
                    return null;
                }
            }).filter( dataset => dataset );
        const observedPlotOptions = DEFAULT_PLOT_OPTIONS as IMenuOptions;
        observedPlotOptions.yAxis.useMultipleAxes = true;
        const observedPlot: IPlot = {
            collapsed: false,
            datasets: observedDatasets,
            initialOptions: observedPlotOptions,
            range: {
                start: this.timeRange[0] * 1000,
                end: this.timeRange[1] * 1000
            }
        };
        this._plotsService.addPlot( observedPlot );
    }

    /** returns a value that can be used to set the plot form value */
    getPlotListByFormCategory( plotConfig: IPlotParams[] ) {
        const plotListByCategory = plotConfig.reduce( ( aggregator, plotDatasets) => {
            plotDatasets.datasets.forEach( dataset => {
                if ( imageDatasetCatalog[dataset.datasetId] ) {
                    aggregator.image.push( dataset.datasetId );
                }
                if ( modelDatasetCatalog[dataset.datasetId] ) {
                    aggregator.model.push( ...dataset.rangeVars );
                }
                if ( observedDatasetCatalog[dataset.datasetId] ) {
                    aggregator.observed.push( ...dataset.rangeVars );
                }
            });
            Object.keys( aggregator ).forEach( key => {
                aggregator[key] = Array.from(new Set( aggregator[key] ));
            });
            return aggregator;

        }, { image: [], model: [], observed: []});
        return plotListByCategory;
    }
}
