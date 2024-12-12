import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MaterialModule } from 'src/app/modules';

import { ContoursComponent } from './contours.component';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ContoursComponent', () => {
    let component: ContoursComponent;
    let fixture: ComponentFixture<ContoursComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ContoursComponent ],
            imports: [
                BrowserAnimationsModule,
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
        fixture = TestBed.createComponent(ContoursComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
