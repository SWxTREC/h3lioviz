import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { snakeCase } from 'lodash';
import { debounceTime } from 'rxjs/operators';
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
    controlPanel = new FormGroup({
        bvec: new FormControl(false),
        cme: new FormControl(false),
        data: new FormControl(false),
        latSlice: new FormControl(true),
        lonArrows: new FormControl(false),
        lonSlice: new FormControl(false),
        lonStreamlines: new FormControl(true),
        magneticFields: new FormGroup({
            x: new FormControl({ value: false, disabled: true }),
            y: new FormControl({ value: false, disabled: true }),
            z: new FormControl({ value: false, disabled: true })
        })
    });
    isIndeterminate: { [parameter: string]: boolean } = {};
    pvView: any;
    zoomState: 'on' | 'off' = 'on';

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
            application: 'enlil',
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
                if ( this.zoomState === 'on' ) {
                    this.pvView.setRpcWheelEvent('viewport.mouse.zoom.wheel');
                }
                this.updateControls( this.controlPanel.value );
            })
            .catch((error: any) => {
                console.error(error);
            });

        this.controlPanel.valueChanges.pipe( debounceTime(300) ).subscribe( newFormValues => {
            this.updateControls( newFormValues );
        });
    }

    determineChildStatus( parentControlName: string, childGroup: string ) {
        const group = this.controlPanel.controls[childGroup] as FormGroup;
        // give the checkbox a beat to change its status
        setTimeout(() => {
            const newValue: boolean = this.controlPanel.value[parentControlName];
            // if parent is toggled, children should match its state
            Object.keys( group.controls ).forEach( control => {
                group.controls[control].setValue(newValue);
            });
        }, 0);
    }

    determineParentStatus( parentControlName: string, childGroup: string ) {
        const group = this.controlPanel.controls[childGroup] as FormGroup;
        // give the checkbox a beat to change its status
        setTimeout(() => {
            // check if all, none, or some of the parent control's child group are checked
            if (Object.values(group.controls).every(control => control.value === true)) {
                this.isIndeterminate[parentControlName] = false;
                this.controlPanel.controls.bvec.setValue(true);
            } else if (Object.values(group.controls).every(control => !control.value )) {
                this.isIndeterminate[parentControlName] = false;
                this.controlPanel.controls.bvec.setValue(false);
            } else {
                this.isIndeterminate[parentControlName] = true;
            }
        }, 0);
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

    updateControls( controlStates: { [parameter: string]: any; } ) {
        const session = this.pvView.get().session;
        Object.keys(controlStates).forEach( control => {
            const state = controlStates[control] === true ? 'on' : 'off';
            const name = snakeCase(control);
            if ( typeof controlStates[control] === 'boolean') {
                session.call('pv.enlil.visibility', [ name, state ]);
            }
        });
        this.pvView.render();
    }
}
