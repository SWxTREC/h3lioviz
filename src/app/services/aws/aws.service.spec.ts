import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { provideRouter } from '@angular/router';

import { environmentConfig } from 'src/environments/environment';

import { AwsService, isLauncherReadyStatus } from './aws.service';

describe('AwsService', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
    let service: AwsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                provideRouter([]),
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        });
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);

        service = TestBed.inject(AwsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // One poll: the EC2 is running, and the launcher readiness GET answers status.
    const pollOnce = ( status: number ) => {
        service.pvServerStarted$.next( false );
        service.monitorPvServer();
        httpTestingController.expectOne( request => request.url.endsWith( 'ec2status' ) ).flush( 'running' );
        httpTestingController.expectOne( request => request.url.startsWith( environmentConfig.sessionManagerURL ) )
            .flush( '', { status, statusText: 'launcher' } );
        service.monitoringInterval.unsubscribe();
    };

    it('connects when the launcher answers 405, as the ParaView 6.x image does', fakeAsync(() => {
        pollOnce( 405 );
        expect( service.pvServerStarted$.value ).toBeTrue();
        tick( 1000 );
    }));

    it('still connects when the launcher answers 400, as ParaView 5.10.1 does', fakeAsync(() => {
        pollOnce( 400 );
        expect( service.pvServerStarted$.value ).toBeTrue();
        tick( 1000 );
    }));

    it('does not connect while a proxy answers for the launcher', fakeAsync(() => {
        pollOnce( 503 );
        expect( service.pvServerStarted$.value ).toBeFalse();
        tick( 1000 );
    }));

    it('treats only the launcher\'s own answers as ready', () => {
        // 400 from ParaView 5.x's wslink, 405 from the wslink with ParaView 6.x
        expect( isLauncherReadyStatus( 400 ) ).toBeTrue();
        expect( isLauncherReadyStatus( 405 ) ).toBeTrue();
        // a network failure, a 200, and what the proxies answer while the launcher is down
        [ 0, 200, 500, 502, 503, 504 ].forEach( status => {
            expect( isLauncherReadyStatus( status ) ).toBeFalse();
        });
    });
});
