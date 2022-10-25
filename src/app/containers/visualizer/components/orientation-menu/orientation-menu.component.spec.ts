import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/modules';

import { OrientationMenuComponent } from './orientation-menu.component';

describe('OrientationMenuComponent', () => {
    let component: OrientationMenuComponent;
    let fixture: ComponentFixture<OrientationMenuComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ OrientationMenuComponent ],
            imports: [ MaterialModule ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OrientationMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
