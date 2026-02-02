import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CatalogService } from './catalog.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CatalogService', () => {
    let service: CatalogService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(CatalogService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
