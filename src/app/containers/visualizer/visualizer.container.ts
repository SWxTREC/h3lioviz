import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter, take } from 'rxjs/operators';
import { AwsService } from 'src/app/services';
import { environmentConfig } from 'src/environments/environment';
import vtkWSLinkClient from 'vtk.js/Sources/IO/Core/WSLinkClient';
import vtkRemoteView, {
    connectImageStream
} from 'vtk.js/Sources/Rendering/Misc/RemoteView';
import SmartConnect from 'wslink/src/SmartConnect';

@Component({
    selector: 'swt-visualizer',
    templateUrl: './visualizer.container.html',
    styleUrls: [ './visualizer.container.scss' ]
})
export class VisualizerComponent implements OnInit, OnDestroy {
    @ViewChild('pvContent', { read: ElementRef }) pvContent: ElementRef;
    loading = true;
    pvView: any;
    timeTicks: number[] = [];
    errorMessage: string;
    validConnection = false;
    visualizerSplit: [number, number] = [ 30, 70 ];
    subscriptions: Subscription[] = [];
    waitingMessages: string[] = [ 'this can take a minute…', 'checking status…', 'looking for updates…' ];
    waitingMessage: string = this.waitingMessages[0];
    pvServerStarted = false;

    constructor(
        private _awsService: AwsService
    ) {
        this._awsService.startUp();
    }

    ngOnInit() {
        const waitingMessageInterval = setInterval(() =>
            this.waitingMessage = this.waitingMessages[Math.floor( Math.random() * ( this.waitingMessages.length ) ) ], 6000);
        this.subscriptions.push( this._awsService.pvServerStarted$.pipe(
            filter( started => started === true),
            take(1)
        ).subscribe( started => {
            this.pvServerStarted = started;
            if ( !this.validConnection && started === true ) {
                // add setTimeout to skip a beat and avoid the expressionChanged error with AfterViewInit
                setTimeout(() => this.connectToSocket());
                if (waitingMessageInterval) {
                    clearInterval(waitingMessageInterval);
                }
            }
        }));
    }

    connectToSocket(): void {
        // set up websocket
        vtkWSLinkClient.setSmartConnectClass(SmartConnect);
        const clientToConnect = vtkWSLinkClient.newInstance();
        const divRenderer = this.pvContent.nativeElement;

        // Error
        clientToConnect.onConnectionError((httpReq: { response: { error: any; }; }) => {
            this.validConnection = false;
            const message = ( httpReq?.response?.error ) || `Connection error`;
            this.errorMessage = message;
        });

        // Close
        clientToConnect.onConnectionClose(( httpReq: { response: { error: any; }; } ) => {
            this.validConnection = false;
            const message = (httpReq?.response?.error) || `Connection closed`;
            this.errorMessage = message;
        });

        clientToConnect.onConnectionReady( validClient => {
            this.errorMessage = undefined;
            const session = validClient.getConnection().getSession();
            this.validConnection = true;

            const viewStream = validClient.getImageStream().createViewStream( -1 );
            const remoteView = vtkRemoteView.newInstance({ session, viewStream });

            this.pvView = remoteView;
            this.pvView.setContainer( divRenderer );
            this.pvView.setInteractiveRatio( 1 ); // the scaled image compared to the client's view resolution
            this.pvView.setInteractiveQuality( 100 ); // jpeg quality

            window.addEventListener( 'resize', this.pvView.resize );

            this.pvView.setRpcWheelEvent( 'viewport.mouse.zoom.wheel' );

            this.pvView.get().session.call('pv.time.index.set', [ 0 ]);
            this.pvView.get().session.call('pv.time.values', []).then( (timeValues: number[]) => {
                this.timeTicks = timeValues.map( value => Math.round(value));
                this.loading = false;
                session.call('pv.vcr.action', [ 'first' ]);
            });
        });

        const config = environmentConfig;
        // TODO?: after login, access clientId and client credentials to this config: config?

        // Connect
        clientToConnect.connect(config).then( () => {
            // if connection fails, add error message
            if (!clientToConnect.isConnected()) {
                this.errorMessage = 'Failed to connect to socket';
            }
        });

        // if the socket doesn't connect after 10 seconds, show an error
        setTimeout( () => {
            if (!clientToConnect.isConnected()) {
                this.errorMessage = 'Failed to connect to socket';
            }
        }, 1000 * 10);
    }

    ngOnDestroy() {
        this.unsubscribeAll();
    }

    getTimestep( timeIndex: number ) {
        this.loading = true;
        const session = this.pvView.get().session;
        session.call('pv.time.index.set', [ timeIndex ]).then( () => this.loading = false );
    }

    restart() {
        this._awsService.startUp();
    }

    unsubscribeAll() {
        this.subscriptions.forEach( subscription => subscription.unsubscribe() );
    }
}
