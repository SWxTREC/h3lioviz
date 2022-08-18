import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LaspBaseAppSnippetsService } from 'lasp-base-app-snippets';
import { LaspNavService } from 'lasp-nav';
import { BehaviorSubject } from 'rxjs';
import { Subscription } from 'rxjs/internal/Subscription';
import { distinctUntilChanged } from 'rxjs/operators';
import { AwsService, FooterService, WebsocketService } from 'src/app/services';
import { environment } from 'src/environments/environment';

import { RunSelectorComponent } from './components';

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
    componentMaxHeight: number;
    errorMessage: string;
    loading = true;
    pvServerStarted = false;
    pvView: any = this._websocket.pvView;
    runId$: BehaviorSubject<string> = new BehaviorSubject(undefined);
    showButton = true;
    splitDirection: 'horizontal' | 'vertical' = 'horizontal';
    subscriptions: Subscription[] = [];
    timeIndex: number;
    timeTicks: number[] = [];
    validConnection = this._websocket.validConnection$.value;
    version = environment.version;
    vizMax: number;
    vizMin = 300;
    vizSize: number;
    waitingMessages: string[] = [ 'this can take a minute…', 'checking status…', 'looking for updates…' ];
    waitingMessage: string = this.waitingMessages[0];

    @HostListener( 'window:resize')
    onResize() {
        this.setMaxHeights();
        // pvView.resize
        this.pvView?.resize();
    }

    constructor(
        public dialog: MatDialog,
        public footerService: FooterService,
        private _awsService: AwsService,
        private _laspNavService: LaspNavService,
        private _scripts: LaspBaseAppSnippetsService,
        private _websocket: WebsocketService
    ) {
        footerService.showGlobalFooter = false;
        this.setMaxHeights();
        this._laspNavService.setAlwaysSticky(true);
        this._awsService.startUp();
        this.vizSize = JSON.parse( sessionStorage.getItem( 'vizSize' ) ) || this.vizMax;
    }

    ngOnInit() {
        this._scripts.misc.ignoreMaxPageWidth( this );
        // get the last run id, if there is one, from sessionStorage
        const runId = JSON.parse( sessionStorage.getItem( 'runId' ) );
        this.runId$.next( runId );
        if ( !this.runId$.value ) {
            this.openDialog();
        }

        this.subscriptions.push(
            this.runId$.pipe( distinctUntilChanged() ).subscribe( id => {
                // if runId is selected and valid connection, load run data
                if ( id != null && this.validConnection ) {
                    this.loadModel();
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
            this._websocket.errorMessage$.subscribe( errorMessage => this.errorMessage = errorMessage )
        );
    }

    ngAfterViewInit(): void {
        this.subscriptions.push( this._websocket.validConnection$.subscribe( validConnection => {
            this.validConnection = validConnection;
            // pvView will be undefined if no validConnection and defined and initialized if validConnection
            this.pvView = this._websocket.pvView;
            if ( this.validConnection ) {
                const divRenderer = this.pvContent.nativeElement;
                this.pvView.setContainer( divRenderer );
                // Use the following lines to get the run catalog from the server, then copy to assets
                // this.pvView.get().session.call( 'pv.h3lioviz.get_available_runs' ).then( runs => {
                //     console.log({ runs });
                // });
                // websocket is connected, if runId, load run data
                if ( this.runId$.value ) {
                    this.loadModel();
                }
            }
        }));
    }

    ngOnDestroy() {
        this._laspNavService.setAlwaysSticky( false );
        this.footerService.showGlobalFooter = true;
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    getTimeTicks() {
        // check for a stored time index
        // TODO: don't check for stored time index if new run, either that, or connect a time index to its run id
        const timeIndex: number = JSON.parse(sessionStorage.getItem('timeIndex'));
        this.pvView.get().session.call('pv.time.values', []).then( (timeValues: number[]) => {
            this.timeTicks = timeValues.map( value => Math.round( value ) );
            if ( timeIndex ) {
                this.timeIndex = timeIndex;
                this.setTimestep( timeIndex );
            } else {
                this.timeIndex = 0;
                this.setTimestep( 0 );
            }
        });
    }

    // called only when both pvView and runId$.value are true
    loadModel() {
        // get run
        this.pvView.get().session.call( 'pv.h3lioviz.load_model', [ this.runId$.value ] ).then( () => {
            this.getTimeTicks();
        }).catch( error => {
            // show error message and start over
            this.validConnection = false;
            this.errorMessage = ( error.data ? error.data.exception + ' ': 'unknown error loading ') + this.runId$.value ;
            sessionStorage.removeItem('runId');
        });
    }

    openDialog(): void {
        this.showButton = false;
        const dialogRef = this.dialog.open(RunSelectorComponent, {
            data: { runId: this.runId$.value },
            disableClose: this.runId$.value == null,
            autoFocus: false
        });

        dialogRef.afterClosed().subscribe(result => {
            this.runId$.next(result);
            this.showButton = true;
            sessionStorage.setItem( 'runId', JSON.stringify(this.runId$.value) );
        });
    }

    dragEnd( event: any ) {
        sessionStorage.setItem('vizSize', JSON.stringify( event.sizes[0] ));
    }

    setMaxHeights() {
        // get max dimension of visualization
        const width: number = window.innerWidth;
        const height: number = window.innerHeight;
        const landscape: boolean = width > height;
        this.componentMaxHeight = height - headerFooterHeight;
        // set splitDirection and vizMax
        if ( landscape ) {
            this.splitDirection = 'horizontal';
            this.vizMax = this.componentMaxHeight - (playerHeight);
        } else {
            this.splitDirection = 'vertical';
            this.vizMax = width;
        }
        // ensure vizSize is not greater than vizMax
        this.vizSize = Math.min( this.vizSize, this.vizMax);
        sessionStorage.setItem('vizSize', JSON.stringify(this.vizSize));
    }

    setTimestep( timeIndex: number ) {
        this.loading = true;
        this.pvView.get().session.call('pv.time.index.set', [ timeIndex ]).then( () => this.loading = false );
        sessionStorage.setItem('timeIndex', JSON.stringify(this.timeIndex) );
    }

    refresh() {
        window.location.reload(true);
    }
}
