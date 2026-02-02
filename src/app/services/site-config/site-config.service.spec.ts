import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';

import { provideRouter } from '@angular/router';
import { ChartModule } from 'scicharts';

import { SiteConfigService } from './site-config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('SiteConfigService', () => {
    let service: SiteConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ChartModule,
                MatDialogModule
            ],
            providers: [
                provideRouter([]),
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(SiteConfigService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
