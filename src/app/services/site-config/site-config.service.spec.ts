import { TestBed } from '@angular/core/testing';
import { MatLegacyDialogModule } from '@angular/material/legacy-dialog';
import { RouterTestingModule } from '@angular/router/testing';

import { SiteConfigService } from './site-config.service';

describe('SiteConfigService', () => {
    let service: SiteConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ RouterTestingModule, MatLegacyDialogModule ]
        });
        service = TestBed.inject(SiteConfigService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
