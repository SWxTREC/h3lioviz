import { TestBed } from '@angular/core/testing';

import { SiteConfigService } from './site-config.service';

describe('SiteConfigService', () => {
    let service: SiteConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SiteConfigService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
