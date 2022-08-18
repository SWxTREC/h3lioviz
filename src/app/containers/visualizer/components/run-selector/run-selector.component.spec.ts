import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunSelectorComponent } from './run-selector.component';

describe('RunSelectorComponent', () => {
    let component: RunSelectorComponent;
    let fixture: ComponentFixture<RunSelectorComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ RunSelectorComponent ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RunSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
