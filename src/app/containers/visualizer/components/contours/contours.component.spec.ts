import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/modules';

import { ContoursComponent } from './contours.component';

describe('ContoursComponent', () => {
    let component: ContoursComponent;
    let fixture: ComponentFixture<ContoursComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ContoursComponent ],
            imports: [
                MaterialModule,
                NgxSliderModule,
                ReactiveFormsModule
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
