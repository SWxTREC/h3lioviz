import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrientationMenuComponent } from './orientation-menu.component';

describe('OrientationMenuComponent', () => {
  let component: OrientationMenuComponent;
  let fixture: ComponentFixture<OrientationMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrientationMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrientationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
