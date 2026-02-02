import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { AngularSplitModule } from 'angular-split';
import { LaspFooterModule } from 'lasp-footer';
import { MomentModule } from 'ngx-moment';
import { ChartModule, GridComponent } from 'scicharts';
import { ComponentsModule } from 'src/app/modules';
import { MaterialModule } from 'src/app/modules/material.module';
import { AwsService } from 'src/app/services';

import {
    ColorsComponent,
    HintsComponent,
    MouseZoomComponent,
    OrientationMenuComponent,
    PlotsComponent,
    SlicesComponent,
    TimePlayerComponent
} from './components';
import { VisualizerComponent } from './visualizer.container';

describe('VisualizerComponent', () => {
    let component: VisualizerComponent;
    let fixture: ComponentFixture<VisualizerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColorsComponent,
                HintsComponent,
                SlicesComponent,
                GridComponent,
                OrientationMenuComponent,
                MouseZoomComponent,
                PlotsComponent,
                TimePlayerComponent,
                VisualizerComponent
            ],
            imports: [
                AngularSplitModule,
                BrowserAnimationsModule,
                ChartModule,
                ComponentsModule,
                ReactiveFormsModule,
                LaspFooterModule,
                MaterialModule,
                MomentModule,
                NgxSliderModule
            ],
            providers: [
                AwsService,
                provideRouter([]),
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VisualizerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    xit('should create', () => {
        expect(component).toBeTruthy();
    });
});
