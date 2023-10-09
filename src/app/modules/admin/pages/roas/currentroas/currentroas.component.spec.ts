import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentroasComponent } from './currentroas.component';

describe('CurrentroasComponent', () => {
  let component: CurrentroasComponent;
  let fixture: ComponentFixture<CurrentroasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentroasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentroasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
