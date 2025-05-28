import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ChartModule } from 'scicharts';
import { MaterialModule } from 'src/app/modules';

import { ColorsComponent } from './colors.component';

describe('ColorsComponent', () => {
    let component: ColorsComponent;
    let fixture: ComponentFixture<ColorsComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ColorsComponent ],
            imports: [
                BrowserAnimationsModule,
                ChartModule,
                HttpClientTestingModule,
                MaterialModule,
                NgxSliderModule,
                ReactiveFormsModule
            ],
            providers: [
                provideRouter([])
            ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
