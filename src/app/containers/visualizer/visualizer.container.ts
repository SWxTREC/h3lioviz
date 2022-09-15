import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LaspBaseAppSnippetsService } from 'lasp-base-app-snippets';
import { LaspNavService } from 'lasp-nav';
import { BehaviorSubject, Subject } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IModelMetadata } from 'src/app/models';
import { AwsService, CatalogService, WebsocketService } from 'src/app/services';
import { environment } from 'src/environments/environment';

import { RunSelectorDialogComponent } from './components';

// change these values if the height of the header, footer, or player changes
const headerFooterHeight = 44 + 28;
const playerHeight = 81;

@Component({
    selector: 'swt-visualizer',
    templateUrl: './visualizer.container.html',
    styleUrls: [ './visualizer.container.scss' ]
})

export class VisualizerComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild( 'pvContent', { read: ElementRef } ) pvContent: ElementRef;
    catalog: IModelMetadata[];
    componentMaxHeight: number;
    errorMessage: string = null;
    loading = true;
    panelSize: number;
    pvServerStarted = false;
    pvView: any = this._websocket.pvView;
    resizing = true;
    runId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
    splitDirection: 'horizontal' | 'vertical' = 'horizontal';
    subscriptions: Subscription[] = [];
    timeIndex: number;
    timeTicks: number[];
    validConnection = this._websocket.validConnection$.value;
    version = environment.version;
    // [ width, height ] for paraview resize, drag direction is variable so assign appropriately
    vizDimensions: [ number, number ] = [ undefined, undefined ];
    vizMin = 300;
    waitingMessages: string[] = [ 'this can take a minute…', 'checking status…', 'looking for updates…' ];
    waitingMessage: string = this.waitingMessages[0];
    windowResize$: Subject<void> = new Subject();


    @HostListener( 'window:resize')
    onResize() {
        // TODO: refine this instead of reinitializing dimensions
        sessionStorage.removeItem( 'vizDimensions' );
        this.windowResize$.next();
    }

    constructor(
        public dialog: MatDialog,
        private _awsService: AwsService,
        private _catalogService: CatalogService,
        private _laspNavService: LaspNavService,
        private _scripts: LaspBaseAppSnippetsService,
        private _websocket: WebsocketService
    ) {
        this._laspNavService.setAlwaysSticky(true);
        this._awsService.startUp();
        this.timeTicks = JSON.parse(sessionStorage.getItem('timeTicks')) || [];

        this.subscriptions.push(
            this.windowResize$.pipe(
                debounceTime( 300 )
            ).subscribe(() => {
                this.initVizDimensions();
                this.pvViewResize();
            })
        );

    }
    
    ngOnInit() {
        this.initVizDimensions();
        this._scripts.misc.ignoreMaxPageWidth( this );
        // get the last run id, if there is one, from sessionStorage
        const savedRunId = JSON.parse( sessionStorage.getItem( 'runId' ) ) || null;
        this.runId$.next( savedRunId );

        this.subscriptions.push(
            this._catalogService.catalog$.subscribe( catalog => {
                this.catalog = catalog;
                // if waiting for web socket, open the dialog so the user has something to do
                if ( this.catalog && !this.validConnection ) {
                    this.openDialog();
                }
            })
        );

        this.subscriptions.push(
            this.runId$.pipe(
                distinctUntilChanged()
            ).subscribe( id => {
                // if runId is selected and valid connection, load run data
                if ( id != null && this.validConnection ) {
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
                if (waitingMessageInterval) {
                    clearInterval(waitingMessageInterval);
                }
            })
        );

        // show error messages for a failed websocket connection
        this.subscriptions.push(
            this._websocket.errorMessage$.subscribe( socketErrorMessage => {
                this.errorMessage = socketErrorMessage;
                if ( socketErrorMessage != null ) {
                    // close the dialog if the socket does not connect
                    this.dialog.closeAll();
                }
            })
        );
    }

    ngAfterViewInit(): void {
        this.subscriptions.push( this._websocket.validConnection$.subscribe( validConnection => {
            this.validConnection = validConnection;
            // pvView will be undefined if no validConnection and defined and initialized if validConnection
            this.pvView = this._websocket.pvView;
            this.pvViewResize();
            if ( this.validConnection ) {
                this.errorMessage = null;
                this.dialog.closeAll();
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
        this.saveSettings();
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    dragEnd( event: any ) {
        const newSize = event.sizes[0];
        if ( this.splitDirection === 'horizontal' ) {
            // landscape, new width
            this.vizDimensions[0] = newSize;
        } else {
            // portrait, new height
            this.vizDimensions[1] = newSize - playerHeight;
        }
        this.pvViewResize();
        this.storeValidVizDimensions();
    }

    getTimeTicks( timeIndex: number ) {
        this.pvView.get().session.call('pv.time.values', []).then( (timeValues: number[]) => {
            this.timeTicks = timeValues.map( value => Math.round( value ) );
            this.setTimestep( timeIndex );
        });
    }

    /* note window dimensions and keep track of viz dimensions
    * panel size (height or width, depending on direction) is calculated from relevant viz dimension
    */
    initVizDimensions() {
        const windowWidth: number = window.innerWidth;
        const windowHeight: number = window.innerHeight;
        const landscapeWindow: boolean = windowWidth > windowHeight;
        // height of window whether landscape or portrait
        this.componentMaxHeight = windowHeight - headerFooterHeight;
        const storedDimensions = JSON.parse( sessionStorage.getItem( 'vizDimensions' ) );
        // set splitDirection and dimensions
        if ( landscapeWindow ) {
            this.splitDirection = 'horizontal';
            // height is limiting factor
            const vizMaxHeight = this.componentMaxHeight - playerHeight;
            const defaultPanelWidth = windowWidth * 0.35;
            if ( storedDimensions ) {
                this.vizDimensions = storedDimensions;
                // ensure new height is not greater than vizMaxHeight for this window
                this.vizDimensions[1] = Math.min( storedDimensions[1], vizMaxHeight);
            } else {
                // initialize to defaultPanelWidth and vizMaxHeight
                this.vizDimensions = [ defaultPanelWidth, vizMaxHeight ];
            }
            // for landscape, panelSize is width
            this.panelSize = this.vizDimensions[0] ?? defaultPanelWidth;
        } else {
            this.splitDirection = 'vertical';
            // width is limiting factor
            const defaultVizHeight = (this.componentMaxHeight * 0.5) - playerHeight;
            if ( storedDimensions ) {
                this.vizDimensions = storedDimensions;
                // ensure new width is not greater than maxWidth for this window
                this.vizDimensions[0] = Math.min( storedDimensions[0], windowWidth);
            } else {
                // initialize to windowWidth and defaultVizHeight
                this.vizDimensions = [ windowWidth, defaultVizHeight ];
            }
            // for portrait, panelSize is height plus playerHeight
            this.panelSize = this.vizDimensions[1] ?
                this.vizDimensions[1] + playerHeight : defaultVizHeight + playerHeight;
        }
        this.storeValidVizDimensions();
    }

    // called only when both pvView and runId$.value are true
    loadModel( runId: string ) {
        this.errorMessage = null;
        // check for a stored time index for this runId, default to 0
        const timeIndexMap: { [runId: string]: number } = JSON.parse(sessionStorage.getItem('timeIndexMap'));
        const timeIndex: number = timeIndexMap && timeIndexMap[ runId ] ? timeIndexMap[ runId ] : 0;

        // if there are timeTicks, then the model has already been loaded, skip to set timeIndex
        if ( this.timeTicks.length ) {
            this.setTimestep( timeIndex );
        } else {
            // load new model run and get time ticks (slow)
            this.pvView.get().session.call( 'pv.h3lioviz.load_model', [ runId ] ).then( () => {
                this.getTimeTicks( timeIndex );
            }).catch( (error: { data: { exception: string } }) => {
                this.errorMessage = 'select another value, ' +
                    (error.data ? error.data.exception + ' ': 'unknown error loading ') + runId;
                // remove bad runId and allow user to try again…
                this.updateRunId( null );
            });
        }
    }

    // only opens if no valid connection, to give the user a task while websocket is connecting
    openDialog(): void {
        const dialogRef = this.dialog.open(RunSelectorDialogComponent, {
            data: { runId: this.runId$.value, catalog: this.catalog },
            width: '325px'
        });
        dialogRef.afterClosed().subscribe( result => {
            if ( result ) {
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

    saveSettings() {
        sessionStorage.setItem( 'runId', JSON.stringify(this.runId$.value) );
        sessionStorage.setItem('timeTicks', JSON.stringify(this.timeTicks));
        const userTimeIndexMap: { [runId: string]: number } = JSON.parse(sessionStorage.getItem('timeIndexMap')) ?? {};
        userTimeIndexMap[ this.runId$.value ] = this.timeIndex;
        sessionStorage.setItem('timeIndexMap', JSON.stringify(userTimeIndexMap) );
    }

    setTimestep( timeIndex: number ) {
        this.loading = true;
        this.timeIndex = timeIndex;
        this.pvView.get().session.call('pv.time.index.set', [ timeIndex ]).then( () => this.loading = false );
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
                        this.vizDimensions[index] = (this.componentMaxHeight * 0.5) - playerHeight;
                    }
                }
            });
            sessionStorage.setItem('vizDimensions', JSON.stringify(this.vizDimensions));
        }
    }

    refresh() {
        window.location.reload(true);
    }

    updateRunId( runId: string ) {
        // reset timeTicks to trigger new model load
        this.timeTicks = [];
        this.runId$.next( runId );
    }
}
