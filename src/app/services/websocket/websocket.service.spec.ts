import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { WebsocketService } from './websocket.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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
});
