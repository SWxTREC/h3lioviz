import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';

import { SiteConfigService } from './site-config.service';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SiteConfigService', () => {
    let service: SiteConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatDialogModule
            ],
            providers: [
                provideRouter([])
            ]
        });
        service = TestBed.inject(SiteConfigService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
