import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveroasComponent } from './liveroas.component';

describe('LiveroasComponent', () => {
  let component: LiveroasComponent;
  let fixture: ComponentFixture<LiveroasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveroasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveroasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
