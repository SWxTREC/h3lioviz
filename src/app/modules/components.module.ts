import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
