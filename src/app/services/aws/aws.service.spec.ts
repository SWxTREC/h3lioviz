import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ProfileNavService } from '..';

import { AwsService } from './aws.service';

describe('AwsService', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;
    let service: AwsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                RouterTestingModule
            ],
            providers: [ ProfileNavService ]
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        httpClient = TestBed.inject(HttpClient);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        httpTestingController = TestBed.inject(HttpTestingController);

        service = TestBed.inject(AwsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
