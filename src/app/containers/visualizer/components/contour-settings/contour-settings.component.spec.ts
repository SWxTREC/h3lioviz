import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContourSettingsComponent } from './contour-settings.component';

describe('ContourSettingsComponent', () => {
    let component: ContourSettingsComponent;
    let fixture: ComponentFixture<ContourSettingsComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ContourSettingsComponent ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContourSettingsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
