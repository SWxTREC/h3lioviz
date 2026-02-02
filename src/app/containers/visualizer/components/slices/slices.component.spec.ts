import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ChartModule } from 'scicharts';
import { MaterialModule } from 'src/app/modules';

import { SlicesComponent } from './slices.component';

describe('SlicesComponent', () => {
    let component: SlicesComponent;
    let fixture: ComponentFixture<SlicesComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ SlicesComponent ],
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
        fixture = TestBed.createComponent(SlicesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
