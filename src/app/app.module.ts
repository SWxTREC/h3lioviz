import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { LaspFooterModule } from 'lasp-footer';
import { LaspFullPageOverlayModule } from 'lasp-full-page-overlay';
import { LaspNavModule } from 'lasp-nav';
import { MarkdownModule } from 'ngx-markdown';

import { ChartModule } from 'scicharts';

import { environment } from 'src/environments/environment';

import { AppComponent } from './app.component';
import { MaterialModule } from './modules';
import { routes } from './routes';
import { AwsService } from './services';

@NgModule({
    declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        ChartModule.forRoot({
            sendAnalytics: environment.production && !environment.dev,
            logAnalyticsCallsToConsole: false
        }),
        FormsModule,
        LaspFooterModule,
        LaspFullPageOverlayModule,
        LaspNavModule,
        MarkdownModule.forRoot({ loader: HttpClient }),
        MaterialModule,
        RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })
    ],
    providers: [
        AwsService,
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { appearance: 'outline' }
        },
        provideHttpClient(withInterceptorsFromDi())
    ]
})
export class AppModule { }
