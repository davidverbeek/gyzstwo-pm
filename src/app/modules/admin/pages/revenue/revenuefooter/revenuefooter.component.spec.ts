import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenuefooterComponent } from './revenuefooter.component';

describe('RevenuefooterComponent', () => {
  let component: RevenuefooterComponent;
  let fixture: ComponentFixture<RevenuefooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RevenuefooterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenuefooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
