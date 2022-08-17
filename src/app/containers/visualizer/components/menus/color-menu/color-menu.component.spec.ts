import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/modules';

import { ColorMenuComponent } from './color-menu.component';

describe('ColorMenuComponent', () => {
    let component: ColorMenuComponent;
    let fixture: ComponentFixture<ColorMenuComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ColorMenuComponent ],
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
        fixture = TestBed.createComponent(ColorMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
