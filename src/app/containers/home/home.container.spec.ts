import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ComponentsModule, MaterialModule } from 'src/app/modules';
import { AwsService } from 'src/app/services';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.container';

describe('HomeComponent', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let httpClient: HttpClient;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let httpTestingController: HttpTestingController;

    let component: HomeComponent;

    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async() => {
        TestBed.configureTestingModule({
            declarations: [ HomeComponent ],
            imports: [
                ComponentsModule,
                HomeRoutingModule,
                MaterialModule
            ],
            providers: [
                AwsService,
                provideRouter([]),
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
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
