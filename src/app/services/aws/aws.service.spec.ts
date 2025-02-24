import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { provideRouter } from '@angular/router';

import { ProfileNavService } from '..';

import { AwsService } from './aws.service';

describe('AwsService', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let httpClient: HttpClient;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let httpTestingController: HttpTestingController;
    let service: AwsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                ProfileNavService,
                provideRouter([])
            ]
        });
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);

        service = TestBed.inject(AwsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
