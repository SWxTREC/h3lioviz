import { Component, Input, OnChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { cloneDeep, uniq } from 'lodash';
import { debounceTime } from 'rxjs/operators';

import {
    IDatasetStrict,
    ImageViewerService,
    IMenuOptions,
    IPlot,
    IPlotParams,
    IRangeVariable,
    MenuOptionsService,
    PlotsService,
    UiOptionsService,
    XRangeService
} from 'scicharts';
import {
    ConfigLabels,
    DEFAULT_PLOT_OPTIONS,
    H3LIO_PRESET,
    IMAGE_DATASETS,
    imageDatasetCatalog,
    ISiteConfig,
    IVariableInfo,
    MODEL_VARIABLES,
    modelDatasetCatalog,
    observedDatasetCatalog,
    SATELLITE_NAMES
} from 'src/app/models';
import { PlayingService, SiteConfigService } from 'src/app/services';
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

    modelVariables: IVariableInfo[] = MODEL_VARIABLES;
    observedVariableList: string[] = [ 'speed', 'density', 'temperature' ];
    imageData = IMAGE_DATASETS;
    imageList: string[] = Object.keys(this.imageData);
    plotForm: FormGroup = new FormGroup({
        image: new FormControl(),
        model: new FormControl(),
        observed: new FormControl()
    });
    legendCardToggle = new FormControl();
    siteConfig: ISiteConfig;

    constructor(
        protected _playingService: PlayingService,
        private _imageViewerService: ImageViewerService,
        private _menuOptionsService: MenuOptionsService,
        private _plotsService: PlotsService,
        private _siteConfigService: SiteConfigService,
        private _uiOptionsService: UiOptionsService,
        private _xRangeService: XRangeService
    ) {
        this._menuOptionsService.setGlobalMenuOptions( cloneDeep(DEFAULT_PLOT_OPTIONS) );
        // use methods to set uiOptions
        const uiOptions = this._uiOptionsService.getUiOptions();
        uiOptions.minimumPlotHeight = 50;
        uiOptions.gridHeightCorrection = 200;
        uiOptions.stackedMode = true;
        this._uiOptionsService.setUiOptions( uiOptions );
        this._uiOptionsService.updateFeatures( H3LIO_PRESET );
        this._uiOptionsService.setPlotGrid( 3, 1 );

        this._plotsService.enableCrosshairSync();
        this._xRangeService.enableZoomSyncByVariable( true, 'time' );
        this._imageViewerService.setImageViewerSync( true );

        this.legendCardToggle.valueChanges.pipe(
            takeUntilDestroyed()
        ).subscribe( showCards => {
            if ( showCards ) {
                this._uiOptionsService.setUiOptions({ legend: 'left' });
                this._siteConfigService.updateSiteConfig({ [ConfigLabels.legendCards]: true });
            } else {
                this._uiOptionsService.setUiOptions({ legend: 'minimal' });
                this._siteConfigService.updateSiteConfig({ [ConfigLabels.legendCards]: false });
            }
        });
        // once, on init, set the legend toggle based on the site config
        const legendConfig = this._siteConfigService.getSiteConfig().legendCards;
        this.legendCardToggle.setValue( legendConfig );

        this.plotForm.valueChanges.pipe(
            debounceTime(1000),
            takeUntilDestroyed()
        ).subscribe( (newValue: { image: string[]; model: string[]; observed: string[] }) => {
            const plotList = [];
            if ( newValue.image?.length ) {
                plotList.push(this.getImagePlot( newValue.image ));
            }
            if ( newValue.model?.length) {
                newValue.model.forEach( (variable: string) => {
                    plotList.push(this.getModelPlot(variable));
                });
            }
            if ( newValue.observed?.length ) {
                plotList.push(this.getObservedPlot( newValue.observed ));
            }
            this._plotsService.setPlots( plotList );
        });
    }

    ngOnChanges() {
        const plotsForForm = this.getPlotListByFormCategory( this.plotConfig );
        this.plotForm.setValue( plotsForForm );
    }

    createImageDataset( imageDatasetId: string )  {
        const datasetInfo = this.imageData[imageDatasetId];
        const newDataset: IDatasetStrict = {
            uid: imageDatasetId,
            url: environment.latisUrl + datasetInfo.id + '.jsond',
            name: datasetInfo.displayName,
            rangeVariables: [
                { name: 'url', displayName: 'Image URL' }
            ],
            selectedRangeVariables: [ { name: 'url', displayName: 'Image URL' } ],
            domainVariables: [ 'time' ]
        };
        // some image datasets are converted to files because they are not standard types
        const needsType = !imageDatasetId.includes('image');
        if ( needsType ) {
            newDataset.type = 'STRING_LIST';
        }
        return newDataset;
    }

    createDatasetGroup( rangeVariable: IRangeVariable )  {
        const plotGroup = [];
        // push model data to plotGroup
        [ 'stereoa', 'earth', 'stereob' ].forEach( (satellite: string) => {
            const urlBase: string = environment.production ? environment.aws.api : localUrls.evolutionData;
            const urlSuffix: string = environment.production ? `getTimeSeries/${this.runId}/${satellite}.jsond` : `evo.${satellite}.json`;
            const newDataset: IDatasetStrict = {
                uid: satellite,
                url: urlBase + urlSuffix,
                name: 'Model data ' + SATELLITE_NAMES[satellite],
                rangeVariables: [
                    { name: 'velocity', displayName: 'speed'},
                    { name: 'density', displayName: 'density'},
                    { name: 'pressure', displayName: 'pressure'},
                    { name: 'temperature', displayName: 'temperature'},
                    { name: 'bx', displayName: 'bx'},
                    { name: 'by', displayName: 'by'},
                    { name: 'bz', displayName: 'bz'}
                ],
                selectedRangeVariables: [ rangeVariable ],
                domainVariables: [ 'time' ]
            };
            plotGroup.push( newDataset );
        });
        return plotGroup;
    }

    getImagePlot( imageIds: string[] ) {
        const imageDatasets = imageIds.map( imageId => this.createImageDataset( imageId ));
        const imagePlot: IPlot = {
            datasets: imageDatasets,
            initialOptions: DEFAULT_PLOT_OPTIONS as IMenuOptions,
            range: {
                start: this.timeRange[0] * 1000,
                end: this.timeRange[1] * 1000
            },
            type: 'IMAGE'
        };
        return imagePlot;
    }

    getModelPlot( groupVariable: string ) {
        const rangeVariable: IRangeVariable = modelDatasetCatalog['earth'].rangeVariables.find( v => v.name === groupVariable );
        const datasetGroup = this.createDatasetGroup( rangeVariable );
        const modelPlot: IPlot = {
            datasets: datasetGroup,
            initialOptions: DEFAULT_PLOT_OPTIONS as IMenuOptions,
            range: {
                start: this.timeRange[0] * 1000,
                end: this.timeRange[1] * 1000
            }
        };
        return modelPlot;
    }

    createObservedDataset( instrument: string, rangeVariables: IRangeVariable[] ) {
        if ( instrument === 'mag' ) {
            const archivedMagDataset: IDatasetStrict = {
                uid: 'ace_mag_1m',
                url: environment.latisUrl + 'ace_mag_1m.jsond?',
                name: 'ACE Archived Real Time Mag Data',
                rangeVariables: [
                    { name: 'Bx', displayName: 'Bx' },
                    { name: 'By', displayName: 'By' },
                    { name: 'Bz', displayName: 'Bz' }
                ],
                selectedRangeVariables: rangeVariables,
                domainVariables: [ 'time' ]
            };
            return archivedMagDataset;
        }
        if ( instrument === 'swepam' ) {
            const archivedSwepamDataset: IDatasetStrict = {
                uid: 'ace_swepam_1m',
                url: environment.latisUrl + 'ace_swepam_1m.jsond?',
                name: 'ACE Archived real time Swepam data',
                rangeVariables: [
                    { name: 'density', displayName: 'Density' },
                    { name: 'speed', displayName: 'Speed' },
                    { name: 'temperature', displayName: 'Temperature' }
                ],
                selectedRangeVariables: rangeVariables,
                domainVariables: [ 'time' ]
            };
            return archivedSwepamDataset;
        }
    }

    getObservedPlot( variables: string[] ): IPlot {
        const observedVariablesByInstrument: { [instrument: string]: IRangeVariable[] } = variables.reduce( ( aggregator, variable ) => {
            const mag = new Set([ 'Bx', 'By', 'Bz' ]);
            const swepam = new Set([ 'density', 'speed', 'temperature' ]);
            // push the IRangeVariable to the correct instrument array
            if ( mag.has( variable ) ) {
                const rangeVariable: IRangeVariable =
                observedDatasetCatalog['ace_mag_1m'].rangeVariables.find( vr => vr.name === variable );
                aggregator.mag.push( rangeVariable );
            }
            if ( swepam.has( variable ) ) {
                const rangeVariable: IRangeVariable =
                observedDatasetCatalog['ace_swepam_1m'].rangeVariables.find( vr => vr.name === variable );
                aggregator.swepam.push( rangeVariable );
            }
            return aggregator;
        }, { mag: [], swepam: []});
        const observedDatasets: IDatasetStrict[] = Object.keys( observedVariablesByInstrument )
            .map( key => {
                if ( observedVariablesByInstrument[key].length ) {
                    return this.createObservedDataset(key, observedVariablesByInstrument[key] );
                } else {
                    return null;
                }
            }).filter( dataset => dataset );
        const observedPlotOptions = DEFAULT_PLOT_OPTIONS as IMenuOptions;
        observedPlotOptions.yAxis.useMultipleAxes = false;
        const observedPlot: IPlot = {
            datasets: observedDatasets,
            initialOptions: observedPlotOptions,
            range: {
                start: this.timeRange[0] * 1000,
                end: this.timeRange[1] * 1000
            }
        };
        return observedPlot;
    }

    /** returns a value that can be used to set the plot form value */
    getPlotListByFormCategory( plotConfig: IPlotParams[] ) {
        const plotListByCategory = plotConfig.reduce( ( aggregator, plotDatasets) => {
            plotDatasets.datasets.forEach( dataset => {
                if ( imageDatasetCatalog[dataset.datasetId] ) {
                    aggregator.image.push( dataset.datasetId );
                }
                if ( modelDatasetCatalog[dataset.datasetId] ) {
                    dataset.rangeVars.forEach( ( rangeVar: IRangeVariable ) => {
                        aggregator.model.push( rangeVar.name );
                    });
                }
                if ( observedDatasetCatalog[dataset.datasetId] ) {
                    dataset.rangeVars.forEach( ( rangeVar: IRangeVariable ) => {
                        aggregator.observed.push( rangeVar.name );
                    });
                }
            });
            // make sure there are no duplicates in the arrays
            Object.keys( aggregator ).forEach( key => {
                aggregator[key] = uniq( aggregator[key]);
            });
            return aggregator;

        }, { image: [], model: [], observed: []});
        return plotListByCategory;
    }
}
