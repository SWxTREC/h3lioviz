import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MaterialModule } from 'src/app/modules';

import { ContoursComponent } from './contours.component';

describe('ContoursComponent', () => {
    let component: ContoursComponent;
    let fixture: ComponentFixture<ContoursComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ContoursComponent ],
            imports: [
                BrowserAnimationsModule,
                MaterialModule,
                NgxSliderModule,
                ReactiveFormsModule,
                RouterTestingModule
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
