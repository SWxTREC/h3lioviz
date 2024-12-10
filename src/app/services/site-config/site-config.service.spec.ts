import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

import { SiteConfigService } from './site-config.service';

describe('SiteConfigService', () => {
    let service: SiteConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ RouterTestingModule, MatDialogModule ]
        });
        service = TestBed.inject(SiteConfigService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
