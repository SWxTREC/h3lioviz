import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/modules';

import { ColorsComponent } from '../colors/colors.component';
import { ContoursComponent } from '../contours/contours.component';
import { LayersComponent } from '../layers/layers.component';

import { ControlPanelComponent } from './control-panel.component';

describe('ControlPanelComponent', () => {
    let component: ControlPanelComponent;
    let fixture: ComponentFixture<ControlPanelComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [
                ControlPanelComponent,
                LayersComponent,
                ContoursComponent,
                ColorsComponent
            ],
            imports: [
                BrowserAnimationsModule,
                MaterialModule,
                NgxSliderModule,
                ReactiveFormsModule
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
