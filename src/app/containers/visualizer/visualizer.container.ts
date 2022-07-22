import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LaspBaseAppSnippetsService } from 'lasp-base-app-snippets';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter } from 'rxjs/operators';
import { AwsService, WebsocketService } from 'src/app/services';

@Component({
    selector: 'swt-visualizer',
    templateUrl: './visualizer.container.html',
    styleUrls: [ './visualizer.container.scss' ]
})
export class VisualizerComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild( 'pvContent', { read: ElementRef } ) pvContent: ElementRef;
    loading = true;
    pvView: any = this._websocket.pvView;
    timeTicks: number[] = [];
    errorMessage: string;
    initialVisualizerSplit: [number, number ] = [ 35, 65 ];
    subscriptions: Subscription[] = [];
    validConnection = this._websocket.validConnection$.value;
    visualizerSplit: [number, number ];
    waitingMessages: string[] = [ 'this can take a minute…', 'checking status…', 'looking for updates…' ];
    waitingMessage: string = this.waitingMessages[0];
    pvServerStarted = false;

    constructor(
        private _awsService: AwsService,
        private _scripts: LaspBaseAppSnippetsService,
        private _websocket: WebsocketService
    ) {
        this._awsService.startUp();
        this.visualizerSplit = JSON.parse(
            sessionStorage.getItem( 'visualizerSplit' )
        ) as [ number, number ] || this.initialVisualizerSplit;
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
        this.subscriptions.push( this._websocket.validConnection$
        .pipe( filter( validConnection => validConnection === true ) ).subscribe( validConnection => {
            this.validConnection = validConnection;
            const divRenderer = this.pvContent.nativeElement;
            // pvView has been initialized
            this.pvView = this._websocket.pvView;
            window.addEventListener( 'resize', this.pvView.resize );
            this.pvView.setContainer( divRenderer );
            this.pvView.get().session.call('pv.time.index.set', [ 0 ]);
            this.pvView.get().session.call('pv.time.values', []).then( (timeValues: number[]) => {
                this.timeTicks = timeValues.map( value => Math.round( value ) );
                this.loading = false;
                this.pvView.get().session.call('pv.vcr.action', [ 'first' ]);
            });
        }));
    }

    ngOnDestroy() {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }

    dragEnd( event: any ) {
        sessionStorage.setItem('visualizerSplit', JSON.stringify( event.sizes ));
    }

    getTimestep( timeIndex: number ) {
        this.loading = true;
        const session = this.pvView.get().session;
        session.call('pv.time.index.set', [ timeIndex ]).then( () => this.loading = false );
    }

    refresh() {
        window.location.reload(true);
    }
}
