import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoascalculationComponent } from './roascalculation.component';

describe('RoascalculationComponent', () => {
  let component: RoascalculationComponent;
  let fixture: ComponentFixture<RoascalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoascalculationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoascalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
