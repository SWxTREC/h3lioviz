import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ChartModule } from 'scicharts';
import { MaterialModule } from 'src/app/modules';

import { MouseZoomComponent } from './mouse-zoom.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('MouseZoomComponent', () => {
    let component: MouseZoomComponent;
    let fixture: ComponentFixture<MouseZoomComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [MouseZoomComponent],
            imports: [
                ChartModule,
                MaterialModule
            ],
            providers: [
                provideRouter([]),
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
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
