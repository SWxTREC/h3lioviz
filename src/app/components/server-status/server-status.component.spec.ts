import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MaterialModule } from 'src/app/modules';

import { ServerStatusComponent } from './server-status.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ServerStatusComponent', () => {
    let component: ServerStatusComponent;
    let fixture: ComponentFixture<ServerStatusComponent>;

    beforeEach(async() => {
        await TestBed.configureTestingModule({
            declarations: [ServerStatusComponent],
            imports: [MaterialModule],
            providers: [
                provideRouter([]),
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting()
            ]
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
