import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LaspBaseAppSnippetsService } from 'lasp-base-app-snippets';
import { LaspNavService } from 'lasp-nav';
import { BehaviorSubject } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { distinctUntilChanged } from 'rxjs/operators';
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
    pvServerStarted = false;
    pvView: any = this._websocket.pvView;
    runId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
    splitDirection: 'horizontal' | 'vertical' = 'horizontal';
    subscriptions: Subscription[] = [];
    timeIndex: number;
    timeTicks: number[];
    validConnection = this._websocket.validConnection$.value;
    version = environment.version;
    // [ width, height ], both can be changed on window resize, user can change width on drag
    vizDimensions: number[] = [];
    vizMin = 300;
    waitingMessages: string[] = [ 'this can take a minute…', 'checking status…', 'looking for updates…' ];
    waitingMessage: string = this.waitingMessages[0];

    @HostListener( 'window:resize')
    onResize() {
        // TODO: add a resize debouncer
        // TODO: refine this instead of reinitializing dimensions
        sessionStorage.removeItem( 'vizDimensions' );
        if ( this.pvView ) {
            this.setVizDimensions();
            this.pvViewResize();
        }
    }

    constructor(
        public dialog: MatDialog,
        private _awsService: AwsService,
        private _catalogService: CatalogService,
        private _laspNavService: LaspNavService,
        private _scripts: LaspBaseAppSnippetsService,
        private _websocket: WebsocketService
    ) {
        this.setVizDimensions();
        this._laspNavService.setAlwaysSticky(true);
        this._awsService.startUp();
        this.timeTicks = JSON.parse(sessionStorage.getItem('timeTicks')) || [];
    }
    
    ngOnInit() {
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

    getTimeTicks( timeIndex: number ) {
        this.pvView.get().session.call('pv.time.values', []).then( (timeValues: number[]) => {
            this.timeTicks = timeValues.map( value => Math.round( value ) );
            this.setTimestep( timeIndex );
        });
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
        this.loading = true;
        this.pvView.get().session.call( 'viewport.size.update', [ -1, this.vizDimensions[0], this.vizDimensions[1] ] ).then( () => {
            this.pvView.resize();
            this.loading = false;
        });
    }

    dragEnd( event: any ) {
        this.loading = true;
        const newSize = event.sizes[0];
        this.vizDimensions[0] = newSize;
        this.pvViewResize();
        sessionStorage.setItem('vizDimensions', JSON.stringify( this.vizDimensions ));
    }

    saveSettings() {
        sessionStorage.setItem( 'runId', JSON.stringify(this.runId$.value) );
        sessionStorage.setItem('timeTicks', JSON.stringify(this.timeTicks));
        const userTimeIndexMap: { [runId: string]: number } = JSON.parse(sessionStorage.getItem('timeIndexMap')) ?? {};
        userTimeIndexMap[ this.runId$.value ] = this.timeIndex;
        sessionStorage.setItem('timeIndexMap', JSON.stringify(userTimeIndexMap) );
    }

    setVizDimensions() {
        // get max dimensions of visualization
        const windowWidth: number = window.innerWidth;
        const windowHeight: number = window.innerHeight;
        const landscapeWindow: boolean = windowWidth > windowHeight;
        this.componentMaxHeight = windowHeight - headerFooterHeight;
        const maxHeight = this.componentMaxHeight - (playerHeight);
        const storedDimensions = JSON.parse( sessionStorage.getItem( 'vizDimensions' ) );
        // set splitDirection and dimensions
        if ( landscapeWindow ) {
            // height is limiting factor
            this.splitDirection = 'horizontal';
            if ( storedDimensions ) {
                // ensure new height is not greater than maxHeight for this window
                this.vizDimensions[1] = Math.min( storedDimensions[1], maxHeight);
            } else {
                // initialize width to half of window and height to maxHeight
                this.vizDimensions = [ windowWidth * 0.5, maxHeight ];
            }
        } else {
            // width is limiting factor
            this.splitDirection = 'vertical';
            const maxWidth = windowWidth;
            if ( storedDimensions ) {
                // ensure new width is not greater than maxWidth for this window
                this.vizDimensions[0] = Math.min( storedDimensions[0], maxWidth);
            } else {
                //  initialize to maxWidth and maxHeight for window
                this.vizDimensions = [ maxWidth, maxHeight ];
            }
        }
        sessionStorage.setItem('vizDimensions', JSON.stringify(this.vizDimensions));
    }

    setTimestep( timeIndex: number ) {
        this.loading = true;
        this.timeIndex = timeIndex;
        this.pvView.get().session.call('pv.time.index.set', [ timeIndex ]).then( () => this.loading = false );
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
