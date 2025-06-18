import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

import { MaterialModule } from 'src/app/modules';

import { ChangelogComponent } from './components';
import { DocsRoutingModule } from './docs-routing.module';
import { DocsComponent } from './docs.component';


@NgModule({
    imports: [
        CommonModule,
        MarkdownModule.forRoot({ loader: HttpClient }),
        MaterialModule,
        DocsRoutingModule
    ],
    declarations: [
        ChangelogComponent,
        DocsComponent
    ]
})
export class DocsModule { }
