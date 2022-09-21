import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { LaspFooterModule } from 'lasp-footer';
import { LaspNavModule } from 'lasp-nav';
import { MarkdownModule } from 'ngx-markdown';

import { AppComponent } from './app.component';
import { AuthGuard } from './guards/auth-guard.service';
import { MaterialModule } from './modules';
import { routes } from './routes';
import { AwsService, ProfileNavService } from './services';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        FlexLayoutModule,
        LaspFooterModule,
        LaspNavModule,
        HttpClientModule,
        MarkdownModule.forRoot({ loader: HttpClient }),
        MaterialModule,
        RouterModule.forRoot( routes, { scrollPositionRestoration: 'enabled', relativeLinkResolution: 'legacy' } )
    ],
    providers: [
        AuthGuard,
        AwsService,
        ProfileNavService,
        // LaspNavService,
        // {
        //     provide: LaspNavService,
        //     useExisting: ProfileNavService
        // },
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { appearance: 'outline' }
        }
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }
