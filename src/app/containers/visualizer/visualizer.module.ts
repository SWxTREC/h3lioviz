import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { AngularSplitModule } from 'angular-split';
import { LaspEnhancedNgxSliderModule } from 'lasp-enhanced-ngx-slider';
import { LaspEnhancedSelectModule } from 'lasp-enhanced-select';
import { MomentModule } from 'ngx-moment';
import { ChartModule } from 'scicharts';
import { ComponentsModule, MaterialModule } from 'src/app/modules';

import {
    ColorsComponent,
    ConfirmationDialogComponent,
    ContoursComponent,
    ControlPanelComponent,
    FeaturesComponent,
    HintsComponent,
    MouseZoomComponent,
    OrientationMenuComponent,
    PlotsComponent,
    RunSelectorComponent,
    RunSelectorDialogComponent,
    SlicesComponent,
    TimePlayerComponent
} from './components';
import { VisualizerRoutingModule } from './visualizer-routing.module';
import { VisualizerComponent } from './visualizer.container';

@NgModule({
    imports: [
        CommonModule,
        ComponentsModule,
        ChartModule,
        FormsModule,
        LaspEnhancedNgxSliderModule,
        LaspEnhancedSelectModule,
        MaterialModule,
        MomentModule,
        AngularSplitModule,
        NgxSliderModule,
        VisualizerRoutingModule,
        ReactiveFormsModule
    ],
    declarations: [
        ColorsComponent,
        ConfirmationDialogComponent,
        ContoursComponent,
        ControlPanelComponent,
        FeaturesComponent,
        HintsComponent,
        SlicesComponent,
        MouseZoomComponent,
        OrientationMenuComponent,
        PlotsComponent,
        RunSelectorComponent,
        RunSelectorDialogComponent,
        TimePlayerComponent,
        VisualizerComponent
    ]
})
export class VisualizerModule { }
