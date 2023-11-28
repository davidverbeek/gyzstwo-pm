import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifypricesComponent } from './verifyprices.component';

describe('VerifypricesComponent', () => {
  let component: VerifypricesComponent;
  let fixture: ComponentFixture<VerifypricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifypricesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifypricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
