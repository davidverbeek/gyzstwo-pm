import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BolmincalculationComponent } from './bolmincalculation.component';

describe('BolmincalculationComponent', () => {
  let component: BolmincalculationComponent;
  let fixture: ComponentFixture<BolmincalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BolmincalculationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BolmincalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
