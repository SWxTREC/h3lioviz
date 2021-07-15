import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { snakeCase } from 'lodash';
import { debounceTime } from 'rxjs/operators';
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
    controlPanel: FormGroup = new FormGroup({
        bvec: new FormControl(false),
        colorVariable: new FormControl('Bz'),
        cme: new FormControl(false),
        latSlice: new FormControl(true),
        lonArrows: new FormControl(false),
        lonSlice: new FormControl(false),
        lonStreamlines: new FormControl(true),
        magneticFields: new FormGroup({
            x: new FormControl({ value: false, disabled: true }),
            y: new FormControl({ value: false, disabled: true }),
            z: new FormControl({ value: false, disabled: true })
        }),
        opacity: new FormControl( 90 )
    });
    colorVariables: string[] = [ 'Velocity', 'Density', 'Temperature', 'B', 'Bx', 'By', 'Bz' ];
    isIndeterminate: { [parameter: string]: boolean } = {};
    pvView: any;
    zoomState: 'on' | 'off' = 'on';

    ngAfterViewInit(): void {
        vtkWSLinkClient.setSmartConnectClass(SmartConnect);
        const clientToConnect = vtkWSLinkClient.newInstance();
        const divRenderer = this.pvContent.nativeElement;

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

        clientToConnect.onConnectionReady( validClient => {
            const session = validClient.getConnection().getSession();

            const viewStream = validClient.getImageStream().createViewStream(-1);
            const remoteView = vtkRemoteView.newInstance({ session, viewStream });

            this.pvView = remoteView;
            this.pvView.setContainer(divRenderer);
            this.pvView.setInteractiveRatio(0.7); // the scaled image compared to the client's view resolution
            this.pvView.setInteractiveQuality(50); // jpeg quality

            window.addEventListener('resize', this.pvView.resize);

            if ( this.zoomState === 'on' ) {
                this.pvView.setRpcWheelEvent('viewport.mouse.zoom.wheel');
            }
            this.updateControls( this.controlPanel.value );
        });

        // only need sessionURL in development environment
        const config = environmentConfig;

        // Connect
        clientToConnect.connect(config);

        this.controlPanel.valueChanges.pipe( debounceTime(300) ).subscribe( newFormValues => {
            this.updateControls( newFormValues );
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

    resetZoom() {
        this.pvView.get().viewStream.resetCamera();
    }

    updateControls( controlStates: { [parameter: string]: any; } ) {
        const session = this.pvView.get().session;
        Object.keys(controlStates).forEach( controlName => {
            if ( typeof controlStates[controlName] === 'boolean') {
                const name = snakeCase(controlName);
                const state = controlStates[controlName] === true ? 'on' : 'off';
                if ( typeof controlStates[controlName] === 'boolean') {
                    session.call('pv.enlil.visibility', [ name, state ]);
                }
            } else if ( controlName === 'opacity') {
                const name = this.controlPanel.value.colorVariable.toLowerCase();
                const opacity = this.controlPanel.value.opacity / 100;
                if ( name[0] === 'b' ) {

                    session.call('pv.enlil.set_opacity', [ name, [ opacity, opacity, opacity ] ]);

                } else {
                    session.call('pv.enlil.set_opacity', [ name, [ opacity, opacity ] ]);
                }
            } else if ( controlName === 'colorVariable') {
                const serverVariable = this.controlPanel.value.colorVariable.toLowerCase();
                this.pvView.get().session.call('pv.enlil.colorby', [ serverVariable ]);
            }
        });
        this.pvView.render();
    }
}
