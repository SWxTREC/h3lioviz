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
        // the AwsService is triggered to start connecting once the visualizer page is loaded
        this._awsService.pvServerStarted$.pipe(
            filter( started => started === true),
            take( 1 )
        ).subscribe( started => {
            this.pvServerStarted$.next( started );
            // once server is started, socket will persist for entire application until closed by inactivity
            if ( this.validConnection$.value === false && started === true ) {
                this.connectToSocket();
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
            // default to mouse zoom
            this.pvView.setRpcWheelEvent( 'viewport.mouse.zoom.wheel' );
            // validate connection after pvView is initialized
            this.validConnection$.next( true );
        });
        
        const config = environmentConfig;
        // TODO?: after login, access clientId and client credentials to this config: config?

        // Connect
        clientToConnect.connect( config ).then( () => {
            // if connection fails, add error message
            if ( !clientToConnect.isConnected() ) {
                this.errorMessage$.next( 'Failed to connect to socket' );
            }
        });

        // if the socket doesn't connect after a delay, show an error
        const connectionDelay = 1000 * 20;
        setTimeout( () => {
            if ( !clientToConnect.isConnected() ) {
                this.errorMessage$.next('Failed to connect to socket');
            }
        }, connectionDelay );
    }
}
