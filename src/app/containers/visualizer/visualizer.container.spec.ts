import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { AngularSplitModule } from 'angular-split';
import { LaspFooterModule } from 'lasp-footer';
import { MomentModule } from 'ngx-moment';
import { GridComponent } from 'scicharts';
import { ComponentsModule } from 'src/app/modules';
import { MaterialModule } from 'src/app/modules/material.module';
import { AwsService, ProfileNavService } from 'src/app/services';

import {
    ColorsComponent,
    HintsComponent,
    LayersComponent,
    MouseZoomComponent,
    OrientationMenuComponent,
    PlotsComponent,
    TimePlayerComponent
} from './components';
import { VisualizerComponent } from './visualizer.container';
import { provideRouter } from '@angular/router';

describe('VisualizerComponent', () => {
    let component: VisualizerComponent;
    let fixture: ComponentFixture<VisualizerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColorsComponent,
                HintsComponent,
                LayersComponent,
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
                ComponentsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                LaspFooterModule,
                MaterialModule,
                MomentModule,
                NgxSliderModule
            ],
            providers: [
                AwsService,
                ProfileNavService,
                provideRouter([])
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
