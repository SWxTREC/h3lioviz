import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ProfileNavService } from '../profile-nav/profile-nav.service';

import { WebsocketService } from './websocket.service';

describe('WebsocketService', () => {
    let service: WebsocketService;
    const routerSpy = {navigate: jasmine.createSpy('navigate')};

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                ProfileNavService,
                { provide: Router, useValue: routerSpy }

            ]
        });
        service = TestBed.inject(WebsocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
