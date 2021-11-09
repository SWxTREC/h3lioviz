import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';

import { TimePlayerComponent } from './time-player.component';

describe('TimePlayerComponent', () => {
    let component: TimePlayerComponent;
    let fixture: ComponentFixture<TimePlayerComponent>;

    beforeEach( async() => {
        await TestBed.configureTestingModule({
            imports: [
                MomentModule,
                ReactiveFormsModule
            ],
            declarations: [ TimePlayerComponent ]
        })
    .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimePlayerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // spyOn(component.pvView, 'get').and.returnValue({});
        // spyOn(component.session, 'call').and.callThrough();
    });

    xit('should create', () => {
        expect(component).toBeTruthy();
    });
});
