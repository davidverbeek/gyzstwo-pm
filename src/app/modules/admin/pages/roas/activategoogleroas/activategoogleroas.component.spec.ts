import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivategoogleroasComponent } from './activategoogleroas.component';

describe('ActivategoogleroasComponent', () => {
  let component: ActivategoogleroasComponent;
  let fixture: ComponentFixture<ActivategoogleroasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivategoogleroasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivategoogleroasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
