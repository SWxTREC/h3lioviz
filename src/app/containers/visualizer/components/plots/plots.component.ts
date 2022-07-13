import { Component, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
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
import { CONTROL_PANEL_DEFAULT_VALUES } from 'src/app/models';

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

const dataUrl =
    'https://gist.githubusercontent.com/greglucas/364ad0b42d03efaa4319967212f43983/raw/d47631f106de9b6b1eba64159846f87098322ba5/';

const SATELLITE_NAMES = {
    earth: 'Earth',
    stereoa: 'Stereo A',
    stereob: 'Stereo B'
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
    variable = CONTROL_PANEL_DEFAULT_VALUES.colorVariable.serverName;
    plotRange: [ number, number ] = [ 1635278400000, 1635883423000 ];

    constructor(
        private _plotsService: PlotsService,
        private _uiOptionsService: UiOptionsService
    ) {
        // this is needed to show values in the legend
        this._plotsService.enableCrosshairSync();
        this._uiOptionsService.updateFeatures( H3LIO_PRESET );
        this._uiOptionsService.setPlotGrid( 3, 1 );
        // subscribe to changes in the plots to determine if a new variable is selected/deselected
        this._plotsService.getPlots$().pipe(
            debounceTime(300)
        ).subscribe( plots => {
            if ( plots.length ) {
                const selectedRangeVariables = plots.reduce( ( aggregator, plot ) => {
                    plot.datasets.forEach( dataset => {
                        dataset.selectedRangeVariables.forEach( variable => {
                            aggregator[variable] = 0;
                        });
                    });
                    return aggregator;
                }, {});
                const selectedRangeVariablesList = Object.keys(selectedRangeVariables);
                // find a variable that is not the same as the old variable
                // if a new variable (if changed), create a new synced plot group with that variable
                const newVariable = selectedRangeVariablesList.find( variable => variable !== this.variable );
                if ( newVariable ) {
                    this.variable = newVariable;
                    this.getSolarWindData( this.variable );
                }
                // for now, make sure there are always 3 datasets in the plot for the user (datasets can be hidden
                // from the plot in ways other than removing, and right now, there is no way to get a dataset back)
                if ( plots[0].datasets.length < 3 ) {
                    this.getSolarWindData( this.variable );
                }
            }
        });
    }
    
    ngOnInit(): void {
        // initialize to the default variable
        this.getSolarWindData( this.variable );
    }

    createPlotGroup( variable: string )  {
        const plotGroup = [];
        [ 'stereoa', 'earth', 'stereob' ].forEach( (satellite: string) => {
            const newDataset = {
                title: SATELLITE_NAMES[satellite],
                url: dataUrl + `evo.${satellite}.json`,
                name: SATELLITE_NAMES[satellite],
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

    getSolarWindData( groupVariable: string ) {
        // reset the plot list
        this._plotsService.setPlots([]);
        const plotGroup = this.createPlotGroup( groupVariable );
        const swPlot: IPlot = {
            collapsed: false,
            datasets: plotGroup,
            initialOptions: DEFAULT_PLOT_OPTIONS as IMenuOptions,
            range: {
                start: this.plotRange[0],
                end: this.plotRange[1]
            }
        };
        this._plotsService.addPlot( swPlot );
    }
}
