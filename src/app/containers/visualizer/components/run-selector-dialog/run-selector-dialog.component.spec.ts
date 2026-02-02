import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/modules';

import { RunSelectorDialogComponent } from './run-selector-dialog.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('RunSelectorDialogComponent', () => {
    let component: RunSelectorDialogComponent;
    let fixture: ComponentFixture<RunSelectorDialogComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [RunSelectorDialogComponent],
            imports: [MaterialModule],
            providers: [
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
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
