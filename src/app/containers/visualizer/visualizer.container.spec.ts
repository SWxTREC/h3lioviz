import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularSplitModule } from 'angular-split';
import { MaterialModule } from 'src/app/modules/material.module';

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
                ReactiveFormsModule,
                MaterialModule,
                NgxSliderModule
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
