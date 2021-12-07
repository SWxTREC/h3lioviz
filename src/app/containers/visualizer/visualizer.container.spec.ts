import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularSplitModule } from 'angular-split';
import { MaterialModule } from 'src/app/modules/material.module';
import { ProfileNavService } from 'src/app/services';

import { ControlPanelComponent, TimePlayerComponent } from './components';
import { VisualizerComponent } from './visualizer.container';

describe('VisualizerComponent', () => {
    let component: VisualizerComponent;
    let fixture: ComponentFixture<VisualizerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ControlPanelComponent,
                TimePlayerComponent,
                VisualizerComponent
            ],
            imports: [
                AngularSplitModule,
                BrowserAnimationsModule,
                HttpClientTestingModule,
                RouterTestingModule,
                ReactiveFormsModule,
                MaterialModule,
                NgxSliderModule
            ],
            providers: [
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
