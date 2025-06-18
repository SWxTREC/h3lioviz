import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';


import { MaterialModule } from 'src/app/modules';

import { ChangelogComponent } from './changelog.component';

describe('ChangelogComponent', () => {
    let component: ChangelogComponent;
    let fixture: ComponentFixture<ChangelogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientModule,
                MarkdownModule.forRoot({ loader: HttpClient }),
                MaterialModule
            ],
            declarations: [ ChangelogComponent ],
            providers: [
                provideRouter([])
            ]

        })
    .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ChangelogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
