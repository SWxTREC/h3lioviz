import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environmentConfig } from 'src/environments/environment';
// eslint-disable-next-line @typescript-eslint/naming-convention
import vtkWSLinkClient from 'vtk.js/Sources/IO/Core/WSLinkClient';

import { onLauncherHost, WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
    let service: WebsocketService;
    const routerSpy = {navigate: jasmine.createSpy('navigate')};

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: Router, useValue: routerSpy },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(WebsocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // Without this, removing onLauncherHost from connect() would pass every other test
    it('connects with onLauncherHost', () => {
        jasmine.clock().install(); // connectToSocket() starts a 20 s timer
        const client = jasmine.createSpyObj( 'client', [
            'onConnectionError', 'onConnectionClose', 'onConnectionReady', 'connect', 'isConnected'
        ] );
        client.connect.and.returnValue( Promise.resolve() );
        spyOn( vtkWSLinkClient, 'newInstance' ).and.returnValue( client );
        try {
            service.connectToSocket();
        } finally {
            jasmine.clock().uninstall();
        }
        expect( client.connect ).toHaveBeenCalledWith( environmentConfig, onLauncherHost );
    });
});

describe('onLauncherHost', () => {
    const sessionManagerURL = 'https://backend.example.org/h3lioviz/paraview/';

    // SWPC: the launcher names the page's host; the websocket must go to the backend's
    it('moves the websocket onto the launcher host, scheme and port', () => {
        const config = { sessionManagerURL, sessionURL: 'ws://page.example.org:9000/h3lioviz/proxy?sessionId=a&path=ws' };
        expect( onLauncherHost( config ).sessionURL ).toBe( 'wss://backend.example.org/h3lioviz/proxy?sessionId=a&path=ws' );
    });

    // LASP: launcher and websocket share a host, so the URL must not change
    it('leaves the URL alone when the hosts already match', () => {
        const sessionURL = 'wss://backend.example.org/h3lioviz/proxy?sessionId=a&path=ws';
        expect( onLauncherHost({ sessionManagerURL, sessionURL }).sessionURL ).toBe( sessionURL );
    });

    // wslink writes into the object it gets back; a copy keeps environmentConfig unchanged
    it('returns a copy when there is no sessionURL yet', () => {
        const config = { sessionManagerURL };
        expect( onLauncherHost( config ) ).toEqual( config );
        expect( onLauncherHost( config ) ).not.toBe( config );
    });
});
