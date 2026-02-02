import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ChartModule } from 'scicharts';
import { MaterialModule } from 'src/app/modules';

import { ColorsComponent } from '../colors/colors.component';
import { ContoursComponent } from '../contours/contours.component';
import { FeaturesComponent } from '../features/features.component';
import { SlicesComponent } from '../slices/slices.component';

import { ControlPanelComponent } from './control-panel.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ControlPanelComponent', () => {
    let component: ControlPanelComponent;
    let fixture: ComponentFixture<ControlPanelComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [
                ControlPanelComponent,
                FeaturesComponent,
                SlicesComponent,
                ContoursComponent,
                ColorsComponent
            ],
            imports: [
                BrowserAnimationsModule,
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
        fixture = TestBed.createComponent(ControlPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
