import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
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
                NgxSliderModule,
                MaterialModule,
                ReactiveFormsModule
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
