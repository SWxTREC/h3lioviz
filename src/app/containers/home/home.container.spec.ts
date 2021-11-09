import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AwsService, ProfileNavService } from 'src/app/services';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.container';

describe('HomeComponent', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    let component: HomeComponent;

    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async() => {
        TestBed.configureTestingModule({
            imports: [
                HomeRoutingModule,
                HttpClientTestingModule,
                RouterTestingModule
            ],
            declarations: [ HomeComponent ],
            providers: [
                AwsService,
                ProfileNavService
            ]
        });
        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
