import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ChartModule } from 'scicharts';
import { MaterialModule } from 'src/app/modules';

import { FeaturesComponent } from './features.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('FeaturesComponent', () => {
    let component: FeaturesComponent;
    let fixture: ComponentFixture<FeaturesComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [FeaturesComponent],
            imports: [
                BrowserAnimationsModule,
                ChartModule,
                NgxSliderModule,
                MaterialModule,
                ReactiveFormsModule
            ],
            providers: [
                provideRouter([]),
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FeaturesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
