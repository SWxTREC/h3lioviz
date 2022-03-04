import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/modules';
import { ProfileNavService } from 'src/app/services';

import { ServerStatusComponent } from './server-status.component';

describe('ServerStatusComponent', () => {
    let component: ServerStatusComponent;
    let fixture: ComponentFixture<ServerStatusComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ ServerStatusComponent ],
            imports: [
                HttpClientTestingModule,
                MaterialModule,
                RouterTestingModule
            ],
            providers: [ ProfileNavService ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ServerStatusComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
