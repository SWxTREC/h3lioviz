import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/modules';

import { MouseZoomComponent } from './mouse-zoom.component';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('MouseZoomComponent', () => {
    let component: MouseZoomComponent;
    let fixture: ComponentFixture<MouseZoomComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ MouseZoomComponent ],
            imports: [
                HttpClientTestingModule,
                MaterialModule
            ],
            providers: [
                provideRouter([])
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
