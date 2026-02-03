import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ChartModule } from 'scicharts';
import { MaterialModule } from 'src/app/modules';

import { ContoursComponent } from './contours.component';

describe('ContoursComponent', () => {
    let component: ContoursComponent;
    let fixture: ComponentFixture<ContoursComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ContoursComponent ],
            imports: [
                ChartModule,
                MaterialModule,
                NgxSliderModule,
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
        fixture = TestBed.createComponent(ContoursComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
