import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ChartModule, GridComponent } from 'scicharts';
import { MaterialModule } from 'src/app/modules';

import { PlotsComponent } from './plots.component';

describe('PlotsComponent', () => {
    let component: PlotsComponent;
    let fixture: ComponentFixture<PlotsComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [
                PlotsComponent,
                GridComponent
            ],
            imports: [
                BrowserAnimationsModule,
                ChartModule,
                MaterialModule,
                ReactiveFormsModule
            ],
            providers: [
                provideRouter([]),
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlotsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
