import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunSelectorDialogComponent } from './run-selector-dialog.component';

describe('RunSelectorDialogComponent', () => {
    let component: RunSelectorDialogComponent;
    let fixture: ComponentFixture<RunSelectorDialogComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ RunSelectorDialogComponent ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RunSelectorDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
