import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
                MaterialModule,
                NgxSliderModule,
                ReactiveFormsModule
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
