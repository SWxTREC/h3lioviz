import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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
export class VisualizerComponent implements AfterViewInit {
    @ViewChild('pvContent', { read: ElementRef }) pvContent: ElementRef;
    loading = true;
    pvView: any;
    timeTicks: number[] = [];

    ngAfterViewInit(): void {
        // set up websocket
        vtkWSLinkClient.setSmartConnectClass(SmartConnect);
        const clientToConnect = vtkWSLinkClient.newInstance();
        const divRenderer = this.pvContent.nativeElement;

        // Error
        clientToConnect.onConnectionError((httpReq: { response: { error: any; }; }) => {
            const message = ( httpReq && httpReq.response && httpReq.response.error ) || `Connection error`;
            console.error( message );
            console.log( httpReq );
        });

        // Close
        clientToConnect.onConnectionClose(( httpReq: { response: { error: any; }; } ) => {
            const message =
                (httpReq && httpReq.response && httpReq.response.error) ||
                `Connection close`;
            console.error( message );
            console.log( httpReq );
        });

        clientToConnect.onConnectionReady( validClient => {
            const session = validClient.getConnection().getSession();

            const viewStream = validClient.getImageStream().createViewStream( -1 );
            const remoteView = vtkRemoteView.newInstance({ session, viewStream });

            this.pvView = remoteView;
            this.pvView.setContainer( divRenderer );
            this.pvView.setInteractiveRatio( 1 ); // the scaled image compared to the client's view resolution
            this.pvView.setInteractiveQuality( 100 ); // jpeg quality

            window.addEventListener( 'resize', this.pvView.resize );

            this.pvView.setRpcWheelEvent( 'viewport.mouse.zoom.wheel' );

            this.pvView.get().session.call('pv.time.value.set', [ 0 ]);
            this.pvView.get().session.call('pv.time.values', []).then( (timeValues: number[]) => {
                this.timeTicks = timeValues;
                this.loading = false;
            });
        });

        // only need sessionURL in development environment
        const config = environmentConfig;

        // Connect
        clientToConnect.connect( config );
    }

    getTimeStep( timeIndex: number ) {
        this.loading = true;
        const session = this.pvView.get().session;
        session.call('pv.time.index.set', [timeIndex]);
        session.call('pv.time.index.get', []).then( () => this.loading = false);
    }
}
