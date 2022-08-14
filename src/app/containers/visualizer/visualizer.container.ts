import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LaspBaseAppSnippetsService } from 'lasp-base-app-snippets';
import { LaspNavService } from 'lasp-nav';
import { Subscription } from 'rxjs/internal/Subscription';
import { AwsService, WebsocketService } from 'src/app/services';

@Component({
    selector: 'swt-visualizer',
    templateUrl: './visualizer.container.html',
    styleUrls: [ './visualizer.container.scss' ]
})

export class VisualizerComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild( 'pvContent', { read: ElementRef } ) pvContent: ElementRef;
    errorMessage: string;
    loading = true;
    // change these values if the height of the header or player changes
    headerHeight = 44;
    playerHeight = 81;
    pvServerStarted = false;
    pvView: any = this._websocket.pvView;
    subscriptions: Subscription[] = [];
    timeIndex: number;
    timeTicks: number[] = [];
    validConnection = this._websocket.validConnection$.value;
    vizMax: number;
    vizMin = 300;
    vizSize: number;
    waitingMessages: string[] = [ 'this can take a minute…', 'checking status…', 'looking for updates…' ];
    waitingMessage: string = this.waitingMessages[0];

    @HostListener( 'window:resize')
    onResize() {
        this.vizMax = this.getVizMax();
        // after window resize ensure vizSize is not greater than new vizMax
        this.vizSize = Math.min( this.vizSize, this.vizMax);
        sessionStorage.setItem('vizSize', JSON.stringify(this.vizSize));
        // pvView.resize
        this.pvView?.resize();
    }

    constructor(
        private _awsService: AwsService,
        private _laspNavService: LaspNavService,
        private _scripts: LaspBaseAppSnippetsService,
        private _websocket: WebsocketService
    ) {
        this.vizMax = this.getVizMax();
        this._laspNavService.setAlwaysSticky(true);
        this._awsService.startUp();
        this.vizSize = JSON.parse( sessionStorage.getItem( 'vizSize' ) ) || this.vizMax;
    }

    ngOnInit() {
        this._scripts.misc.ignoreMaxPageWidth( this );

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
                // check for a stored time index
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
        }));
    }

    ngOnDestroy() {
        this._laspNavService.setAlwaysSticky( false );
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    getVizMax() {
        // get max height of visualization, window height minus header plus player
        return window.innerHeight - ( this.headerHeight + this.playerHeight );
    }

    dragEnd( event: any ) {
        sessionStorage.setItem('vizSize', JSON.stringify( event.sizes[0] ));
    }

    setTimestep( timeIndex: number ) {
        this.loading = true;
        this.pvView.get().session.call('pv.time.index.set', [ timeIndex ]).then( () => this.loading = false );
    }

    refresh() {
        window.location.reload(true);
    }
}
