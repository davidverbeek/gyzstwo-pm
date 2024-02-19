import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BolminimumComponent } from './bolminimum.component';

describe('BolminimumComponent', () => {
  let component: BolminimumComponent;
  let fixture: ComponentFixture<BolminimumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BolminimumComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BolminimumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
