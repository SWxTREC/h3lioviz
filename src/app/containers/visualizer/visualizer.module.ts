import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { MomentModule } from 'ngx-moment';
import { ComponentsModule, MaterialModule } from 'src/app/modules';

import { ControlPanelComponent, PlotsComponent, TimePlayerComponent } from './components';
import { VisualizerRoutingModule } from './visualizer-routing.module';
import { VisualizerComponent } from './visualizer.container';

@NgModule({
    imports: [
        CommonModule,
        ComponentsModule,
        MaterialModule,
        MomentModule,
        AngularSplitModule,
        NgxSliderModule,
        VisualizerRoutingModule,
        ReactiveFormsModule
    ],
    declarations: [
        VisualizerComponent,
        ControlPanelComponent,
        PlotsComponent,
        TimePlayerComponent
    ]
})
export class VisualizerModule { }
