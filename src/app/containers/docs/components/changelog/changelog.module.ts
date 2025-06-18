import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';


import { MaterialModule } from 'src/app/modules';

import { ChangelogRoutingModule } from './changelog-routing.module';
import { ChangelogComponent } from './changelog.component';


@NgModule({
    imports: [
        CommonModule,
        MarkdownModule.forRoot({ loader: HttpClient }),
        MaterialModule,
        ChangelogRoutingModule
    ],
    declarations: [ ChangelogComponent ]
})
export class ChangelogModule { }
