import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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
    pvView: any;
    zoomState: 'on' | 'off' = 'off';

    ngAfterViewInit(): void {
        vtkWSLinkClient.setSmartConnectClass(SmartConnect);

        const divRenderer = this.pvContent.nativeElement;

        this.pvView = vtkRemoteView.newInstance();
        this.pvView.setContainer(divRenderer);
        this.pvView.setInteractiveRatio(0.7); // the scaled image compared to the client's view resolution
        this.pvView.setInteractiveQuality(50); // jpeg quality

        window.addEventListener('resize', this.pvView.resize);

        const clientToConnect = vtkWSLinkClient.newInstance();

        // Error
        clientToConnect.onConnectionError((httpReq: { response: { error: any; }; }) => {
            const message =
                (httpReq && httpReq.response && httpReq.response.error) ||
                `Connection error`;
            console.error(message);
            console.log(httpReq);
        });

        // Close
        clientToConnect.onConnectionClose((httpReq: { response: { error: any; }; }) => {
            const message =
                (httpReq && httpReq.response && httpReq.response.error) ||
                `Connection close`;
            console.error(message);
            console.log(httpReq);
        });

        // hint: if you use the launcher.py and ws-proxy just leave out sessionURL
        // (it will be provided by the launcher)
        const config = {
            application: 'cone',
            sessionURL: 'ws://localhost:1234/ws'
        };

        // Connect
        clientToConnect
            .connect(config)
            .then((validClient: { getConnection: () => { (): any; new(): any; getSession: { (): any; new(): any; }; }; }) => {
                connectImageStream(validClient.getConnection().getSession());

                const session = validClient.getConnection().getSession();
                this.pvView.setSession(session);
                this.pvView.setViewId(-1);
                this.pvView.render();
            })
            .catch((error: any) => {
                console.error(error);
            });
    }

    toggleZoom() {
        const getZoom = this.pvView.get().rpcWheelEvent;
        // if zoom is on, turn it off and vice versa
        if ( getZoom ) {
            this.zoomState = 'off';
            this.pvView.setRpcWheelEvent(undefined);
        } else {
            this.zoomState = 'on';
            this.pvView.setRpcWheelEvent('viewport.mouse.zoom.wheel');
        }
    }
}
