import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/modules';

import { ZoomMenuComponent } from './mouse-zoom.component';

describe('ZoomMenuComponent', () => {
    let component: ZoomMenuComponent;
    let fixture: ComponentFixture<ZoomMenuComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ZoomMenuComponent ],
            imports: [ MaterialModule ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ZoomMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
