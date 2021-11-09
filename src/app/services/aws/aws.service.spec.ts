import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AwsService } from './aws.service';

describe('AwsService', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
    let service: AwsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ]
        });
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);

        service = TestBed.inject(AwsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
