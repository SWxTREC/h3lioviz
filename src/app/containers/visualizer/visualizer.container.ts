import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import vtkWSLinkClient from 'vtk.js/Sources/IO/Core/WSLinkClient';
import SmartConnect from 'wslink/src/SmartConnect';
import vtkRemoteView, {
    connectImageStream,
} from 'vtk.js/Sources/Rendering/Misc/RemoteView';

@Component({
    selector: 'swt-visualizer',
    templateUrl: './visualizer.container.html',
    styleUrls: ['./visualizer.container.scss']
})
export class VisualizerComponent implements AfterViewInit {
    @ViewChild('content', { read: ElementRef }) content: ElementRef;

    hostElement: HTMLElement; // Native element hosting the SVG container

    constructor(private elRef: ElementRef) {
        this.hostElement = this.elRef.nativeElement;
    }

    ngAfterViewInit(): void {
        vtkWSLinkClient.setSmartConnectClass(SmartConnect);

        const divRenderer = this.hostElement

        // Need this styling for the element otherwise things are stretched out
        divRenderer.style.position = 'relative';
        divRenderer.style.width = '100vw';
        divRenderer.style.height = '100vh';
        divRenderer.style.overflow = 'hidden';

        const view = vtkRemoteView.newInstance({
            rpcWheelEvent: 'viewport.mouse.zoom.wheel',
        });
        view.setContainer(divRenderer);
        view.setInteractiveRatio(0.7); // the scaled image compared to the clients view resolution
        view.setInteractiveQuality(50); // jpeg quality

        window.addEventListener('resize', view.resize);

        const clientToConnect = vtkWSLinkClient.newInstance();

        // Error
        clientToConnect.onConnectionError((httpReq) => {
            const message =
                (httpReq && httpReq.response && httpReq.response.error) ||
                `Connection error`;
            console.error(message);
            console.log(httpReq);
        });

        // Close
        clientToConnect.onConnectionClose((httpReq) => {
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
            sessionURL: 'ws://localhost:1234/ws',
        };

        // Connect
        clientToConnect
            .connect(config)
            .then((validClient) => {
                connectImageStream(validClient.getConnection().getSession());

                const session = validClient.getConnection().getSession();
                view.setSession(session);
                view.setViewId(-1);
                view.render();
            })
            .catch((error) => {
                console.error(error);
            });
    }
}
