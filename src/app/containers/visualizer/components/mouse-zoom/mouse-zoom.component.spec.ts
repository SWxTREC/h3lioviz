import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/modules';

import { MouseZoomComponent } from './mouse-zoom.component';

describe('MouseZoomComponent', () => {
    let component: MouseZoomComponent;
    let fixture: ComponentFixture<MouseZoomComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ MouseZoomComponent ],
            imports: [
                MaterialModule,
                RouterTestingModule
            ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MouseZoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
