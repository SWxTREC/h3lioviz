import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomMenuComponent } from './zoom-menu.component';

describe('ZoomMenuComponent', () => {
    let component: ZoomMenuComponent;
    let fixture: ComponentFixture<ZoomMenuComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ZoomMenuComponent ]
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
