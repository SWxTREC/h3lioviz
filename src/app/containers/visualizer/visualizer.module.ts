import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';

import { MaterialModule } from '../../modules';

import { ControlPanelComponent } from './components';
import { VisualizerRoutingModule } from './visualizer-routing.module';
import { VisualizerComponent } from './visualizer.container';


@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        MomentModule,
        NgxSliderModule,
        VisualizerRoutingModule,
        ReactiveFormsModule
    ],
    declarations: [
        VisualizerComponent,
        ControlPanelComponent
    ]
})
export class VisualizerModule { }
