import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularSplitModule } from 'angular-split';
import { MomentModule } from 'ngx-moment';
import { GridComponent } from 'scicharts';
import { ComponentsModule } from 'src/app/modules';
import { MaterialModule } from 'src/app/modules/material.module';
import { AwsService, ProfileNavService } from 'src/app/services';

import { ControlPanelComponent, PlotsComponent, TimePlayerComponent } from './components';
import { VisualizerComponent } from './visualizer.container';

describe('VisualizerComponent', () => {
    let component: VisualizerComponent;
    let fixture: ComponentFixture<VisualizerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ControlPanelComponent,
                GridComponent,
                PlotsComponent,
                TimePlayerComponent,
                VisualizerComponent
            ],
            imports: [
                AngularSplitModule,
                BrowserAnimationsModule,
                ComponentsModule,
                HttpClientTestingModule,
                RouterTestingModule,
                ReactiveFormsModule,
                MaterialModule,
                MomentModule,
                NgxSliderModule
            ],
            providers: [
                AwsService,
                ProfileNavService
            ]
        })
    .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VisualizerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
