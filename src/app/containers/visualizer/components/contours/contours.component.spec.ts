import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContoursComponent } from './contours.component';

describe('ContoursComponent', () => {
    let component: ContoursComponent;
    let fixture: ComponentFixture<ContoursComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ContoursComponent ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContoursComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
