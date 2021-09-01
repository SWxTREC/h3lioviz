import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';

import { MaterialModule } from '../../modules';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.container';


@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        MomentModule,
        HomeRoutingModule,
        ReactiveFormsModule
    ],
    declarations: [
        HomeComponent
    ]
})
export class HomeModule { }
