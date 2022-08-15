import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/modules';

import { LayerMenuComponent } from './layer-menu.component';

describe('LayerMenuComponent', () => {
    let component: LayerMenuComponent;
    let fixture: ComponentFixture<LayerMenuComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ LayerMenuComponent ],
            imports: [
                BrowserAnimationsModule,
                NgxSliderModule,
                MaterialModule,
                ReactiveFormsModule
            ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LayerMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
