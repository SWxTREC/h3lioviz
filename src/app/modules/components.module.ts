import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ServerStatusComponent } from '../components/server-status/server-status.component';

import { MaterialModule } from './material.module';

@NgModule({
    declarations: [
        ServerStatusComponent
    ],
    imports: [
        CommonModule,
        MaterialModule
    ],
    exports: [
        ServerStatusComponent
    ]
})
export class ComponentsModule { }
