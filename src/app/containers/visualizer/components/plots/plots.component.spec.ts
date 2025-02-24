import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GridComponent } from 'scicharts';
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
                HttpClientTestingModule,
                MaterialModule,
                ReactiveFormsModule
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
