import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenuecalculationComponent } from './revenuecalculation.component';

describe('RevenuecalculationComponent', () => {
  let component: RevenuecalculationComponent;
  let fixture: ComponentFixture<RevenuecalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenuecalculationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenuecalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
