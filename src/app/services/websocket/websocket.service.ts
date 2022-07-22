import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { environmentConfig } from 'src/environments/environment';
import vtkWSLinkClient from 'vtk.js/Sources/IO/Core/WSLinkClient';
import vtkRemoteView, {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    connectImageStream
} from 'vtk.js/Sources/Rendering/Misc/RemoteView';

import SmartConnect from 'wslink/src/SmartConnect';

import { AwsService } from '../aws/aws.service';


@Injectable({
    providedIn: 'root'
})
export class WebsocketService {
    pvView: any;
    errorMessage$: BehaviorSubject<string> = new BehaviorSubject(null);
    pvServerStarted$: BehaviorSubject<boolean> = new BehaviorSubject( false );
    validConnection$: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        private _awsService: AwsService
    ) {
        this._awsService.pvServerStarted$.pipe(
            filter( started => started === true),
            take( 1 )
        ).subscribe( started => {
            this.pvServerStarted$.next( started );
            if ( this.validConnection$.value === false && started === true ) {
                // add setTimeout to skip a beat and avoid the expressionChanged error with AfterViewInit
                setTimeout(() => this.connectToSocket());
            }
        });
    }
        
    connectToSocket(): void {
        // set up websocket
        vtkWSLinkClient.setSmartConnectClass(SmartConnect);
        const clientToConnect = vtkWSLinkClient.newInstance();

        // Error
        clientToConnect.onConnectionError((httpReq: { response: { error: any } }) => {
            this.validConnection$.next( false );
            const message = ( httpReq?.response?.error ) || `Connection error`;
            this.errorMessage$.next(message);
        });
        
        // Close
        clientToConnect.onConnectionClose(( httpReq: { response: { error: any } } ) => {
            this.validConnection$.next( false );
            const message = (httpReq?.response?.error) || `Connection closed`;
            this.errorMessage$.next(message);
        });

        clientToConnect.onConnectionReady( validClient => {
            this.errorMessage$.next(null);
            const session = validClient.getConnection().getSession();
            
            const viewStream = validClient.getImageStream().createViewStream( -1 );
            const remoteView = vtkRemoteView.newInstance({ session, viewStream });
            this.pvView = remoteView;
            this.pvView.setInteractiveRatio( 1 ); // the scaled image compared to the client's view resolution
            // jpeg quality, reduced to speed up interactions on slow connections
            this.pvView.setInteractiveQuality( 50 );
            this.pvView.setRpcWheelEvent( 'viewport.mouse.zoom.wheel' );
            // only validate connection once pvView is initialized
            this.validConnection$.next( true );
        });
        
        const config = environmentConfig;
        // TODO?: after login, access clientId and client credentials to this config: config?

        // Connect
        clientToConnect.connect(config).then( () => {
            // if connection fails, add error message
            if (!clientToConnect.isConnected()) {
                this.errorMessage$.next('Failed to connect to socket');
            }
        });

        // if the socket doesn't connect after a delay, show an error
        setTimeout( () => {
            if (!clientToConnect.isConnected()) {
                this.errorMessage$.next('Failed to connect to socket');
            }
        }, 1000 * 20);
    }
}
