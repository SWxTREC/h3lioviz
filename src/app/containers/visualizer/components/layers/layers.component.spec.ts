import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ChartModule } from 'scicharts';
import { MaterialModule } from 'src/app/modules';

import { LayersComponent } from './layers.component';

describe('LayersComponent', () => {
    let component: LayersComponent;
    let fixture: ComponentFixture<LayersComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ LayersComponent ],
            imports: [
                BrowserAnimationsModule,
                ChartModule,
                HttpClientTestingModule,
                NgxSliderModule,
                MaterialModule,
                ReactiveFormsModule
            ],
            providers: [
                provideRouter([])
            ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LayersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
