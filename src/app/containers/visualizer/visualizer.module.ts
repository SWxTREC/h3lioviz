import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularSplitModule } from 'angular-split';
import { LaspEnhancedNgxSliderModule } from 'lasp-enhanced-ngx-slider';
import { MomentModule } from 'ngx-moment';
import { ChartModule } from 'scicharts';
import { ComponentsModule, MaterialModule } from 'src/app/modules';

import { ControlPanelComponent, LayerMenuComponent, PlotsComponent, TimePlayerComponent } from './components';
import { VisualizerRoutingModule } from './visualizer-routing.module';
import { VisualizerComponent } from './visualizer.container';

@NgModule({
    imports: [
        CommonModule,
        ComponentsModule,
        ChartModule,
        LaspEnhancedNgxSliderModule,
        MaterialModule,
        MomentModule,
        AngularSplitModule,
        NgxSliderModule,
        VisualizerRoutingModule,
        ReactiveFormsModule
    ],
    declarations: [
        ControlPanelComponent,
        LayerMenuComponent,
        PlotsComponent,
        TimePlayerComponent,
        VisualizerComponent
    ]
})
export class VisualizerModule { }
