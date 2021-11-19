import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ServerStatusComponent } from 'src/app/components';
import { MaterialModule } from 'src/app/modules';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.container';

@NgModule({
    imports: [
        CommonModule,
        HomeRoutingModule,
        MaterialModule
    ],
    declarations: [
        HomeComponent,
        ServerStatusComponent
    ]
})
export class HomeModule { }
