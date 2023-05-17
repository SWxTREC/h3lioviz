import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute } from '@angular/router';
import { SplitComponent } from 'angular-split';
import { LaspBaseAppSnippetsService } from 'lasp-base-app-snippets';
import { LaspNavService } from 'lasp-nav';
import { isEmpty, isEqual } from 'lodash';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { BehaviorSubject, Subject } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IPlotParams } from 'scicharts';
import { ConfigLabels, DEFAULT_SITE_CONFIG, IModelMetadata, ISiteConfig } from 'src/app/models';
import {
    AwsService,
    CatalogService,
    SiteConfigService,
    WebsocketService
} from 'src/app/services';
import { environment } from 'src/environments/environment';

import { RunSelectorDialogComponent } from './components';

// change these values if the height of the header or footer changes
const headerFooterHeight = 44 + 28;
// height of components attached to the viz, currently the player and the toolbar
const vizAccessoriesHeight = 81 + 45;

@Component({
    selector: 'swt-visualizer',
    templateUrl: './visualizer.container.html',
    styleUrls: [ './visualizer.container.scss' ]
})

export class VisualizerComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild( 'pvContent', { read: ElementRef } ) pvContent: ElementRef;
    @ViewChild( 'drawer') drawer: MatSidenav;
    @ViewChild(SplitComponent) splitElement: SplitComponent;

    catalog: IModelMetadata[];
    componentMaxHeight: number;
    controlPanelSize = 300;
    errorMessage: string = null;
    gutterSize = 11;
    loading = true;
    openPlots: boolean;
    openControls: boolean;
    plotConfig: IPlotParams[];
    previousVizWidth: number;
    pvServerStarted = false;
    pvView: any = this._websocket.pvView;
    resizing = true;
    runId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
    runTitle: string;
    showTitle: boolean;
    siteConfig: ISiteConfig;
    splitDirection: 'horizontal' | 'vertical' = 'horizontal';
    subscriptions: Subscription[] = [];
    timeIndex: number;
    timeTicks: number[];
    validConnection = this._websocket.validConnection$.value;
    version = environment.version;
    // dimensions are [ width, height ] for paraview resize, drag direction is variable so assign appropriately
    vizDimensions: [ number, number ] = [ undefined, undefined ];
    vizPanelSize: number;
    waitingMessages: string[] = [ 'this can take a minute…', 'checking status…', 'looking for updates…' ];
    waitingMessage: string = this.waitingMessages[0];
    windowResize$: Subject<void> = new Subject();
    // dimensions are [ width, height ]
    windowDimensions: number[];

    @HostListener( 'window:resize')
    onResize() {
        this.windowResize$.next();
    }

    constructor(
        public dialog: MatDialog,
        private _activatedRoute: ActivatedRoute,
        private _awsService: AwsService,
        private _catalogService: CatalogService,
        private _changeDetector: ChangeDetectorRef,
        private _laspNavService: LaspNavService,
        private _scripts: LaspBaseAppSnippetsService,
        private _siteConfigService: SiteConfigService,
        private _websocket: WebsocketService
    ) {
        this._laspNavService.setAlwaysSticky(true);
        this._awsService.startUp();

        const queryParamMap = this._activatedRoute.snapshot.queryParamMap;
        // see if there is a site config, if so, use it
        if (queryParamMap.has('lz')) {
            // unpack the url into a site config object
            const expandedConfigString = decompressFromEncodedURIComponent(queryParamMap.get('lz'));
            const expandedConfig: ISiteConfig = JSON.parse(expandedConfigString, (key, value) => {
                // NOTE, this function does not work if you have a config with a simple true/false boolean value
                if (key !== '') {
                    return JSON.parse(value);
                }
                return value;
            });
            this.initializeSiteConfig( expandedConfig );
        } else {
            // bootstrap the url config from sessionStorage first and then fall back to DEFAULT for value
            const configFromStorageOrDefault: ISiteConfig = {} as ISiteConfig;
            Object.keys( DEFAULT_SITE_CONFIG ).forEach( parameter => {
                const paramValue = this._siteConfigService.getParamFromStorage(ConfigLabels[parameter]);
                if ( !isEmpty(paramValue) && !isEqual(DEFAULT_SITE_CONFIG[ ConfigLabels[parameter]], paramValue) ) {
                    configFromStorageOrDefault[ ConfigLabels[parameter]] = paramValue;
                } else {
                    configFromStorageOrDefault[ ConfigLabels[parameter] ] = DEFAULT_SITE_CONFIG[ ConfigLabels[parameter] ];
                }
            });
            this.initializeSiteConfig( configFromStorageOrDefault );
        }

        this.subscriptions.push(
            this.windowResize$.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                // TODO: refine this instead of reinitializing dimensions
                this._siteConfigService.updateSiteConfig( { [ConfigLabels.vDimensions]: [ undefined, undefined ]} );
                this.windowDimensions = [ window.innerWidth, window.innerHeight ];
                this._siteConfigService.updateSiteConfig({ [ConfigLabels.wDimensions]: this.windowDimensions });
                this.initVizDimensions();
                this.pvViewResize();
                this.determineShowTitle();
            })
        );
    }

    ngOnInit() {
        this._scripts.misc.ignoreMaxPageWidth( this );
        const storedWindowDimensions = this.siteConfig?.wDimensions;
        const hasStoredWindowDimensions = storedWindowDimensions?.every( value => value != null );
        this.windowDimensions = [ window.innerWidth, window.innerHeight ];
        const windowSizeChanged = hasStoredWindowDimensions && !isEqual( this.windowDimensions, storedWindowDimensions );
        // if window size does not match, start vizDimensions from scratch
        if ( windowSizeChanged ) {
            this.windowResize$.next();
        } else {
            this.initVizDimensions();
        }

        this.subscriptions.push(
            this._catalogService.catalog$.subscribe( catalog => {
                this.catalog = catalog;
                // if waiting for aws server, open the dialog so the user has something to do
                setTimeout(() => {
                    if ( (this.catalog && !this.runId$.value) ||
                        (this.catalog && !this.pvServerStarted) ) {
                        this.openDialog();
                    } else {
                        this.dialog.closeAll();
                    }
                }, 0);
            })
        );

        this.subscriptions.push(
            this.runId$.pipe(
                distinctUntilChanged()
            ).subscribe( id => {
                // if runId is selected and valid connection, load run data
                if ( id != null && this.validConnection ) {
                    this.dialog.closeAll();
                    this.loadModel( id );
                }
            })
        );

        const waitingMessageInterval = setInterval(() =>
            this.waitingMessage = this.waitingMessages[ Math.floor( Math.random() * ( this.waitingMessages.length ) ) ], 6000);

        // show a waiting message until the pvServer has started
        this.subscriptions.push(
            this._websocket.pvServerStarted$.subscribe( started => {
                this.pvServerStarted = started;
                if ( this.pvServerStarted === true && this.runId$.value ) {
                    this.dialog.closeAll();
                }
                if (waitingMessageInterval) {
                    clearInterval(waitingMessageInterval);
                }
            })
        );

        // show error messages for a failed websocket connection
        this.subscriptions.push(
            this._websocket.errorMessage$.subscribe( socketErrorMessage => {
                this.errorMessage = socketErrorMessage;
            })
        );
        this.openControls = this.siteConfig[ ConfigLabels.vPanelSettings ][0];
        this.openPlots = this.siteConfig[ ConfigLabels.vPanelSettings ][1];
    }

    ngAfterViewInit(): void {
        this.setControlPanel();
        this.setPlotsPanel();
        this.subscriptions.push( this._websocket.validConnection$.subscribe( validConnection => {
            this.validConnection = validConnection;
            // pvView will be undefined if no validConnection and defined and initialized if validConnection
            this.pvView = this._websocket.pvView;
            this.pvViewResize();
            if ( this.validConnection ) {
                this.errorMessage = null;
                const divRenderer = this.pvContent.nativeElement;
                this.pvView.setContainer( divRenderer );
                // websocket is connected, if runId, load run data
                if ( this.runId$.value != null ) {
                    this.loadModel( this.runId$.value );
                }
            }
        }));
    }

    ngOnDestroy() {
        this._laspNavService.setAlwaysSticky( false );
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    determineShowTitle() {
        this.showTitle =
            (this.splitDirection === 'horizontal' && this.vizDimensions[0] > 600) ||
            (this.splitDirection === 'vertical' && this.windowDimensions[0] > 480 );
    }

    dragEnd( event: any ) {
        const newSize = event.sizes[0];
        if ( this.splitDirection === 'horizontal' ) {
            // landscape, new width
            this.vizDimensions[0] = newSize;
        } else {
            // portrait, new height
            this.vizDimensions[1] = newSize - vizAccessoriesHeight;
        }
        this.determineShowTitle();
        this.pvViewResize();
        this.storeValidVizDimensions();
    }

    getTimeTicks( timeIndex?: number ) {
        this.pvView.get().session.call('pv.time.values', []).then( (timeValues: number[]) => {
            this.timeTicks = timeValues.map( value => Math.round( value ) );
            const defaultTimeIndex = Math.trunc(this.timeTicks.length / 2) || 16;
            timeIndex = timeIndex ?? defaultTimeIndex;
            this.setTimestep( timeIndex );
            this._siteConfigService.updateSiteConfig({ [ConfigLabels.timeIndexMap]: { [this.runId$.value]: timeIndex }});
        });
    }

    /** Use the config from Url -> Storage -> Defaults to initialize the site */
    initializeSiteConfig( config: ISiteConfig ) {
        // this runs once on init, do tasks that need doing here
        this.siteConfig = config;
        // setSiteConfig here instead of update since we are initializing
        this._siteConfigService.setSiteConfig( config );
        if ( config[ ConfigLabels.runId ] ) {
            this.runId$.next( config[ ConfigLabels.runId ] );
        }
    }

    /* note window dimensions and keep track of viz dimensions
    * viz panel size (height or width, depending on direction) is calculated from relevant viz dimension
    */
    initVizDimensions() {
        const landscapeWindow: boolean = this.windowDimensions[0] > this.windowDimensions[1];
        // height of window whether landscape or portrait
        this.componentMaxHeight = this.windowDimensions[1] - headerFooterHeight;
        const storedVizDimensions: [ number, number ] = this.siteConfig?.vDimensions;
        // set splitDirection and dimensions
        if ( landscapeWindow ) {
            this.splitDirection = 'horizontal';
            // height is limiting factor
            const vizMaxHeight = this.componentMaxHeight - vizAccessoriesHeight;
            const availableWindowWidth = this.openControls ? this.windowDimensions[0] - this.controlPanelSize : this.windowDimensions[0];
            const defaultVizWidth = this.openPlots ? availableWindowWidth * 0.5 - this.gutterSize : availableWindowWidth;
            if ( storedVizDimensions?.every( value => value != null ) ) {
                this.vizDimensions = storedVizDimensions;
                // ensure new height is not greater than vizMaxHeight for this window
                this.vizDimensions[1] = Math.min( storedVizDimensions[1], vizMaxHeight);
            } else {
                // initialize to defaultVizWidth and vizMaxHeight
                this.vizDimensions = [ defaultVizWidth, vizMaxHeight ];
            }
            // for landscape, panelSize is width
            this.vizPanelSize = this.vizDimensions[0] ?? defaultVizWidth;
        } else {
            this.splitDirection = 'vertical';
            // width is limiting factor
            const defaultVizHeight = (this.componentMaxHeight * 0.5) - vizAccessoriesHeight;
            if ( storedVizDimensions?.every( value => value != null ) ) {
                this.vizDimensions = storedVizDimensions;
                // ensure new width is not greater than maxWidth for this window
                this.vizDimensions[0] = Math.min( storedVizDimensions[0], this.windowDimensions[0]);
            } else {
                // initialize to window width and defaultVizHeight
                this.vizDimensions = [ this.windowDimensions[0], defaultVizHeight ];
            }
            // for portrait, vizPanelSize is height plus attached accessories: player and toolbar
            this.vizPanelSize = this.vizDimensions[1] ?
                this.vizDimensions[1] + vizAccessoriesHeight : defaultVizHeight;
        }
        this.storeValidVizDimensions();
    }

    /* called only when both pvView and runId$.value are true */
    loadModel( runId: string ) {
        this.errorMessage = null;
        this._siteConfigService.updateSiteConfig({ [ConfigLabels.runId]: runId });
        // get current plotConfig
        this.plotConfig = this._siteConfigService.getSiteConfig()[ ConfigLabels.plots ];

        this.runTitle = this._catalogService.runTitles[this.runId$.value];

        // check for a stored time index for this runId
        const timeIndexMap = this._siteConfigService.getSiteConfig()[ ConfigLabels.timeIndexMap ];
        const timeIndex: number = timeIndexMap && timeIndexMap[ runId ] ? timeIndexMap[ runId ] : undefined;

        this.pvView.get().session.call( 'pv.h3lioviz.load_model', [ runId ] ).then( () => {
            this.getTimeTicks( timeIndex );
        }).catch( (error: { data: { exception: string } }) => {
            this.errorMessage = 'select another value, ' +
                (error.data ? error.data.exception + ' ': 'unknown error loading ') + runId;
            // remove bad runId and allow user to try again…
            this.updateRunId( null );
        });
    }

    // opens if AWS server is starting up to give the user something to do
    openDialog(): void {
        const dialogRef = this.dialog.open(RunSelectorDialogComponent, {
            data: { runId: this.runId$.value, catalog: this.catalog },
            disableClose: !this.runId$.value
        });
        dialogRef.afterClosed().subscribe( result => {
            if ( result && result !== this.runId$.value ) {
                this.updateRunId( result );
            }
        });
    }

    pvViewResize() {
        if ( this.pvView ) {
            this.resizing = true;
            this.pvView.get().session.call( 'viewport.size.update', [ -1, this.vizDimensions[0], this.vizDimensions[1] ] ).then( () => {
                this.pvView.resize();
                // delay a beat to allow for render time
                setTimeout(() => this.resizing = false, 500);
            });
        }
    }

    refresh() {
        window.location.reload();
    }

    setControlPanel() {
        this.openControls ? this.drawer.open() : this.drawer.close();
        // for portrait, control panel pushes over vertical panels
        // if horizontal panels and plots panel is open, plots panel will squish to accomodate the control panel
        // otherwise, if no plots panel, viz needs to be resized
        if ( this.splitDirection === 'horizontal' && !this.openPlots ) {
            this.vizDimensions[0] = this.openControls ? this.windowDimensions[0] - this.controlPanelSize : this.windowDimensions[0];
            this.pvViewResize();
            this.storeValidVizDimensions();
        }
        this.determineShowTitle();
        const vPanelSettings = [ this.openControls, this.openPlots ];
        this._siteConfigService.updateSiteConfig( { [ConfigLabels.vPanelSettings]: vPanelSettings} );
    }

    setPlotsPanel() {
        // plot panel only opens and closes in the horizontal direction
        if ( this.splitDirection === 'horizontal' ) {
            // Gets the sizes of the visible panels
            const sizes = this.splitElement.getVisibleAreaSizes();
            // if two visible split areas, preserve the viz width so it can be restored
            this.previousVizWidth = sizes.length === 2 ? Number(sizes[0]) : this.previousVizWidth ;
            const maximumVizWidth = this.openControls ? this.windowDimensions[0] - this.controlPanelSize : this.windowDimensions[0];
            if ( this.splitDirection === 'horizontal' ) {
                // restore to previous, if no previous, use a default width
                const vizWidth = this.previousVizWidth || this.vizDimensions[0];
                this.vizDimensions[0] = this.openPlots ? vizWidth : maximumVizWidth;
            } else {
                this.vizDimensions[0] = maximumVizWidth;
            }
            this.vizPanelSize = this.vizDimensions[0];
            this.determineShowTitle();
            this.pvViewResize();
            this.storeValidVizDimensions();
        }
    }

    setTimestep( timeIndex: number ) {
        this.loading = true;
        this.timeIndex = timeIndex;
        this.pvView.get().session.call('pv.time.index.set', [ timeIndex ]).then( () => this.loading = false );
        const userTimeIndexMap: { [runId: string]: number } = this.siteConfig[ConfigLabels.timeIndexMap] ?? {};
        userTimeIndexMap[ this.runId$.value ] = this.timeIndex;
        this._siteConfigService.updateSiteConfig( { [ConfigLabels.timeIndexMap ]: userTimeIndexMap });
    }

    /* before storing vizDimensions, make sure there are two elements, each a valid number
    * no value in storage forces a reinitialization to the defaults
    */
    storeValidVizDimensions() {
        if ( this.vizDimensions.length === 2 ) {
            this.vizDimensions.forEach( ( dimension: number | '*', index: number ) => {
                if ( dimension === '*' || dimension == null ) {
                    // default to a reasonable size for window
                    if ( index === 0 ) {
                        // width is not defined
                        this.vizDimensions[index] = window.innerWidth * 0.5;
                    } else {
                        // height is not defined
                        this.vizDimensions[index] = (this.componentMaxHeight * 0.5) - vizAccessoriesHeight;
                    }
                }
            });
            this._siteConfigService.updateSiteConfig({ [ConfigLabels.vDimensions]: this.vizDimensions });
        }
    }

    toggleControlPanel() {
        this.openControls = !this.openControls;
        this.setControlPanel();
    }

    togglePlotsPanel() {
        this.openPlots = !this.openPlots;
        this.setPlotsPanel();
    }

    updateRunId( runId: string ) {
        // reset timeTicks to trigger new model load
        this.timeTicks = [];
        // this will destroy the time player so that playing stops
        this._changeDetector.detectChanges();
        this.runId$.next( runId );
    }
}
